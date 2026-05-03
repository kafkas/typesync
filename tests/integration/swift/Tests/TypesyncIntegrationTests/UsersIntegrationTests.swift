import FirebaseFirestore
import Foundation
import XCTest

@testable import TypesyncIntegration

// The generated source intentionally lives outside this file (under
// Sources/TypesyncIntegration/Generated/users.swift). The runner script writes
// it before `swift test` runs.

final class UsersIntegrationTests: XCTestCase {
    func testUserRoundTripsThroughEmulator() async throws {
        let firestore = EmulatorClient.firestore()
        let collection = firestore.collection("test_\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))")

        let sampleData = try Fixtures.loadSample(scenario: "users", name: "john")
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601withFractionalSeconds
        let userIn = try decoder.decode(User.self, from: sampleData)

        XCTAssertEqual(userIn.username, "john_appleseed")
        XCTAssertEqual(userIn.role, .Owner)

        let docRef = collection.document(UUID().uuidString)
        // `setData(from:)` is synchronous on the Codable extension; the write
        // is queued locally and the SDK guarantees a subsequent `getDocument`
        // on the same `DocumentReference` observes it.
        try docRef.setData(from: userIn)

        let snapshot = try await docRef.getDocument()
        XCTAssertTrue(snapshot.exists, "expected the written document to be readable")

        let userOut = try snapshot.data(as: User.self)

        XCTAssertEqual(userOut.username, userIn.username)
        XCTAssertEqual(userOut.role, userIn.role)
        XCTAssertEqual(userOut.createdAt.timeIntervalSince1970,
                       userIn.createdAt.timeIntervalSince1970,
                       accuracy: 0.001,
                       "timestamp should round-trip through Firestore within ms precision")
    }

    func testUserRoleEncodesAsRawString() throws {
        let user = User(
            username: "anyone",
            role: .Admin,
            createdAt: Date(timeIntervalSince1970: 0)
        )

        let encoder = JSONEncoder()
        let data = try encoder.encode(user)
        let decoded = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        XCTAssertEqual(decoded?["role"] as? String, "admin",
                       "string-enum cases should serialize as their raw string value")
    }
}

private extension JSONDecoder.DateDecodingStrategy {
    /// `.iso8601` rejects fractional seconds. Our shared sample fixtures use
    /// fractional seconds so cross-platform serializers can round-trip them
    /// without precision loss.
    static let iso8601withFractionalSeconds = JSONDecoder.DateDecodingStrategy.custom { decoder in
        let container = try decoder.singleValueContainer()
        let raw = try container.decode(String.self)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: raw) {
            return date
        }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: raw) {
            return date
        }
        throw DecodingError.dataCorruptedError(in: container,
            debugDescription: "Invalid ISO-8601 date: \(raw)")
    }
}
