import Foundation
import FirebaseFirestore

struct User: Codable {
    @DocumentID var id: String?
    var username: String
    var createdAt: Date

    private enum CodingKeys: String, CodingKey {
        case id
        case username
        case createdAt = "created_at"
    }
}

