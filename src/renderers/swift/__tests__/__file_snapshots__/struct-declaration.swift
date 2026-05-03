import Foundation

/// A cat
struct Cat: Codable {
    /// Discriminator
    private(set) var type: String = "cat"
    /// How many lives
    var livesLeft: Int
    var nickname: String?

    private enum CodingKeys: String, CodingKey {
        case type
        case livesLeft = "lives_left"
        case nickname
    }
}

