import FirebaseCore
import FirebaseFirestore
import Foundation

/// Configures FirebaseApp + Firestore so they talk to a locally-running
/// Firestore emulator.
///
/// The emulator host/port is read from `FIRESTORE_EMULATOR_HOST`, matching the
/// convention used by `firebase emulators:exec` and the other integration
/// suites in this repo. The project ID is read from `GOOGLE_CLOUD_PROJECT`,
/// defaulting to `demo-integration`.
public enum EmulatorClient {
    /// Returns a `Firestore` instance wired to the emulator. The first call
    /// performs configuration; subsequent calls return the same instance.
    public static func firestore() -> Firestore {
        sharedFirestore
    }

    /// Static `let` initializers run exactly once and are thread-safe, so we
    /// can hide the configuration logic behind a single initialization
    /// closure. `nonisolated(unsafe)` is needed because the `Firestore` type
    /// is not `Sendable` from `FirebaseFirestoreInternal`; thread-safety is
    /// guaranteed by the Firebase SDK at runtime.
    nonisolated(unsafe) private static let sharedFirestore: Firestore = {
        if FirebaseApp.app() == nil {
            // Firebase's validator requires the GOOGLE_APP_ID to match the
            // shape `\d+:\w+:[a-z]+:[a-f0-9]+`; the trailing segment must be
            // hex. The values below are placeholders never sent to a real
            // Firebase project because every test connects to the local
            // emulator.
            let options = FirebaseOptions(
                googleAppID: "1:1234567890:ios:0123456789abcdef",
                gcmSenderID: "1234567890"
            )
            options.projectID = ProcessInfo.processInfo.environment["GOOGLE_CLOUD_PROJECT"]
                ?? "demo-integration"
            options.apiKey = "fake-api-key"
            FirebaseApp.configure(options: options)
        }

        let host = ProcessInfo.processInfo.environment["FIRESTORE_EMULATOR_HOST"]
            ?? "localhost:8080"

        let firestore = Firestore.firestore()
        let settings = firestore.settings
        settings.host = host
        settings.isSSLEnabled = false
        settings.cacheSettings = MemoryCacheSettings()
        firestore.settings = settings
        return firestore
    }()
}
