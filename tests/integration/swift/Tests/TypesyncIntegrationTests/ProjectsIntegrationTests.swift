import FirebaseFirestore
import Foundation
import Testing

@testable import TypesyncIntegration

// Source-of-truth for the generated `Project` model lives at
// `Sources/TypesyncIntegration/Generated/projects.swift`. The orchestrator
// (`scripts/integration-test.ts`) writes it before `swift test` runs.
//
// We construct generated structs via the synthesized memberwise init rather
// than `JSONDecoder` because the Firebase iOS SDK explicitly throws when
// `@DocumentID`-wrapped properties are encoded or decoded with anything other
// than `Firestore.Encoder` / `Firestore.Decoder`.

@Suite("Project @DocumentID rename + swift.name field rename via emulator")
struct ProjectsIntegrationTests {
    @Test("a Project written via setData(from:) round-trips through the emulator: body-side `id` preserved, `displayName` mapped via CodingKeys, and the renamed @DocumentID populated on read")
    func projectRoundTripsThroughEmulator() async throws {
        let firestore = EmulatorClient.firestore()
        let collection = firestore.collection(uniqueCollectionName())

        let sample = try Fixtures.loadSampleAsDict(scenario: "projects", name: "typesync")
        let projectIn = Project(
            id: try unwrap(sample["id"] as? String, "projects/typesync.id"),
            displayName: try unwrap(sample["display_name"] as? String, "projects/typesync.display_name"),
            createdAt: try parseISO8601(try unwrap(sample["created_at"] as? String, "projects/typesync.created_at"))
        )

        // Sanity: the path-derived id is unset before write because there is
        // no document path yet.
        #expect(projectIn.documentId == nil)

        let docRef = collection.document(UUID().uuidString)
        try docRef.setData(from: projectIn)

        let rawSnapshot = try await docRef.getDocument()
        try #require(rawSnapshot.exists)
        let raw = try #require(rawSnapshot.data(), "expected non-empty document data")

        // Wire-level expectations: body-side `id` is preserved under its
        // schema key, the field-level rename writes `displayName` back under
        // its schema key `display_name`, and the renamed @DocumentID property
        // is omitted from the body entirely.
        #expect(raw["id"] as? String == "proj-typesync-001")
        #expect(raw["display_name"] as? String == "Typesync")
        #expect(raw["displayName"] == nil, "the field-rename is Swift-only; the wire key remains `display_name`")
        #expect(raw["documentId"] == nil, "@DocumentID values are omitted from the encoded body")

        let projectOut = try rawSnapshot.data(as: Project.self)
        #expect(projectOut.id == projectIn.id)
        #expect(projectOut.displayName == projectIn.displayName)
        #expect(
            abs(projectOut.createdAt.timeIntervalSince1970 - projectIn.createdAt.timeIntervalSince1970) < 0.001,
            "timestamp should round-trip through Firestore within ms precision"
        )
        #expect(
            projectOut.documentId == docRef.documentID,
            "the renamed @DocumentID property should match the document path id on read"
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
