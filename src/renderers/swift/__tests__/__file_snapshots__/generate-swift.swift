import Foundation

/// A string that uniquely identifies the user.
typealias Username = String

typealias UserMetadata = Any

/// A project within a workspace
struct Project: Codable {
    var name: String
    /// Whether the project is completed.
    var completed: Bool
}

