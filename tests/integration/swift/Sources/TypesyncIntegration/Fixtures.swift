import Foundation

/// Locates JSON sample fixtures shared with the other integration suites.
///
/// The orchestrator (`scripts/integration-test.ts`) sets
/// `TYPESYNC_INTEGRATION_FIXTURES_ROOT` to the absolute path of the shared
/// `tests/integration/_fixtures/` directory before invoking `swift test`.
/// We avoid SwiftPM bundle resources here because they only add complexity
/// for a handful of JSON files.
public enum Fixtures {
    public enum Error: Swift.Error, CustomStringConvertible {
        case rootNotConfigured
        public var description: String {
            switch self {
            case .rootNotConfigured:
                return """
                TYPESYNC_INTEGRATION_FIXTURES_ROOT is not set. Run via \
                `yarn test:integration:swift`, which sets it for you.
                """
            }
        }
    }

    public static func loadSample(scenario: String, name: String) throws -> Data {
        guard let rootPath = ProcessInfo.processInfo.environment["TYPESYNC_INTEGRATION_FIXTURES_ROOT"] else {
            throw Error.rootNotConfigured
        }
        let url = URL(fileURLWithPath: rootPath)
            .appendingPathComponent("samples")
            .appendingPathComponent(scenario)
            .appendingPathComponent("\(name).json")
        return try Data(contentsOf: url)
    }
}
