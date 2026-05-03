import FirebaseFirestore
import Foundation
import Testing

@testable import TypesyncIntegration

// The generated source intentionally lives outside this file (under
// Sources/TypesyncIntegration/Generated/users.swift). The runner script writes
// it before `swift test` runs.
//
// We construct generated structs via the synthesized memberwise init rather
// than `JSONDecoder` because the Firebase iOS SDK explicitly throws when
// `@DocumentID`-wrapped properties are encoded or decoded with anything other
// than `Firestore.Encoder` / `Firestore.Decoder`.

@Suite("Users round-trip via emulator")
struct UsersIntegrationTests {
    @Test("a User written via setData(from:) round-trips through the emulator and gets its @DocumentID populated on read")
    func userRoundTripsThroughEmulator() async throws {
        let firestore = EmulatorClient.firestore()
        let collection = firestore.collection(uniqueCollectionName())

        let sample = try Fixtures.loadSampleAsDict(scenario: "users", name: "john")
        let userIn = User(
            username: try unwrap(sample["username"] as? String, "users/john.username"),
            role: try unwrap(UserRole(rawValue: try unwrap(sample["role"] as? String, "users/john.role")), "UserRole"),
            createdAt: try parseISO8601(try unwrap(sample["created_at"] as? String, "users/john.created_at"))
        )

        let docRef = collection.document(UUID().uuidString)
        // `setData(from:)` is synchronous on the Codable extension; the write
        // is queued locally and the SDK guarantees a subsequent `getDocument`
        // on the same `DocumentReference` observes it.
        try docRef.setData(from: userIn)

        let snapshot = try await docRef.getDocument()
        try #require(snapshot.exists, "expected the written document to be readable")

        let userOut = try snapshot.data(as: User.self)

        #expect(userOut.username == userIn.username)
        #expect(userOut.role == userIn.role)
        #expect(
            abs(userOut.createdAt.timeIntervalSince1970 - userIn.createdAt.timeIntervalSince1970) < 0.001,
            "timestamp should round-trip through Firestore within ms precision"
        )
        #expect(
            userOut.id == docRef.documentID,
            "the @DocumentID property should be populated from the document path on read"
        )
    }

    @Test("setData(from:) writes UserRole as a raw string and omits @DocumentID from the encoded body")
    func userRoleEncodesAsRawStringAndDocumentIdIsOmitted() async throws {
        let firestore = EmulatorClient.firestore()
        let collection = firestore.collection(uniqueCollectionName())

        let user = User(username: "anyone", role: .Admin, createdAt: Date(timeIntervalSince1970: 0))
        let docRef = collection.document(UUID().uuidString)
        try docRef.setData(from: user)

        let snapshot = try await docRef.getDocument()
        let raw = try #require(snapshot.data(), "expected non-empty document data")

        #expect(raw["role"] as? String == "admin")
        #expect(raw["username"] as? String == "anyone")
        #expect(raw["id"] == nil, "@DocumentID is bound to the document path and must not be encoded into the body")
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
