import FirebaseFirestore
import Foundation
import Testing

@testable import TypesyncIntegration

// Round-trips a `bytes`-typed document through the Firestore emulator using
// the **firebase-ios-sdk** Codable bridge. The Swift generator emits
// `Foundation.Data` for each `bytes` field, which is what the Firebase iOS
// SDK uses to represent Firestore's `bytes` value type when encoding /
// decoding via `Firestore.Encoder` / `Firestore.Decoder`.
//
// We assert both the wire-level and Codable-level shapes:
//
//   1. `setData(from:)` accepts a `Secret` whose bytes-typed fields are
//      `Data` values without coercion.
//   2. The raw snapshot (`snapshot.data()`) exposes those fields as
//      `Data` (the Objective-C bridge from `NSData`), including bytes
//      nested inside a list.
//   3. `snapshot.data(as: Secret.self)` rebuilds an equivalent `Secret`
//      whose `Data` payloads are byte-for-byte identical to the input.

@Suite("Secrets bytes round-trip via emulator")
struct SecretsIntegrationTests {
    @Test("a Secret with multiple Data fields (including [Data]) round-trips through the emulator with byte-for-byte preservation")
    func secretRoundTripsThroughEmulator() async throws {
        let firestore = EmulatorClient.firestore()
        let collection = firestore.collection(uniqueCollectionName())

        let sample = try Fixtures.loadSampleAsDict(scenario: "secrets", name: "api-key")
        let payload = try decodeBase64(try unwrap(sample["payload_base64"] as? String, "secrets/api-key.payload_base64"))
        let checksum = try decodeBase64(try unwrap(sample["checksum_base64"] as? String, "secrets/api-key.checksum_base64"))
        let shardsBase64 = try unwrap(sample["shards_base64"] as? [String], "secrets/api-key.shards_base64")
        let shards = try shardsBase64.map { try decodeBase64($0) }

        // Sanity-check the fixture: a buggy generator that aliased all
        // bytes fields to the same `Data` value would still pass
        // otherwise.
        #expect(!payload.isEmpty)
        #expect(checksum.count == 32)
        #expect(payload != checksum)
        #expect(shards.count == 3)

        let secretIn = Secret(
            label: try unwrap(sample["label"] as? String, "secrets/api-key.label"),
            payload: payload,
            checksum: checksum,
            shards: shards,
            createdAt: try parseISO8601(try unwrap(sample["created_at"] as? String, "secrets/api-key.created_at"))
        )

        let docRef = collection.document(UUID().uuidString)
        try docRef.setData(from: secretIn)

        let snapshot = try await docRef.getDocument()
        try #require(snapshot.exists)
        let raw = try #require(snapshot.data(), "expected non-empty document data")

        // Wire-level expectations: the iOS SDK exposes bytes through
        // Foundation.Data on the snapshot (which bridges NSData), both
        // for top-level fields and for entries nested inside a list.
        #expect(raw["payload"] is Data)
        #expect(raw["checksum"] is Data)
        let rawShards = try #require(raw["shards"] as? [Data], "shards should decode as [Data]")
        #expect(rawShards.count == shards.count)

        let secretOut = try snapshot.data(as: Secret.self)

        #expect(secretOut.label == secretIn.label)
        #expect(secretOut.payload == payload)
        #expect(secretOut.checksum == checksum)
        #expect(secretOut.shards.count == shards.count)
        for (i, shard) in secretOut.shards.enumerated() {
            #expect(shard == shards[i])
        }
        #expect(
            abs(secretOut.createdAt.timeIntervalSince1970 - secretIn.createdAt.timeIntervalSince1970) < 0.001,
            "timestamp should round-trip through Firestore within ms precision"
        )
    }
}

private func uniqueCollectionName() -> String {
    "test_" + UUID().uuidString.replacingOccurrences(of: "-", with: "")
}

private struct FixtureError: Error, CustomStringConvertible {
    let description: String
}

private func unwrap<T>(_ value: T?, _ name: String) throws -> T {
    guard let value else {
        throw FixtureError(description: "Missing or wrongly-typed fixture field '\(name)'.")
    }
    return value
}

private func decodeBase64(_ raw: String) throws -> Data {
    guard let data = Data(base64Encoded: raw) else {
        throw FixtureError(description: "Invalid base64 string: \(raw)")
    }
    return data
}

private func parseISO8601(_ raw: String) throws -> Date {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = formatter.date(from: raw) {
        return date
    }
    formatter.formatOptions = [.withInternetDateTime]
    if let date = formatter.date(from: raw) {
        return date
    }
    throw FixtureError(description: "Invalid ISO-8601 date: \(raw)")
}
