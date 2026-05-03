import Foundation
import FirebaseFirestore

struct Project: Codable {
    @DocumentID var documentId: String?
    var displayName: String
    var externalId: String

    private enum CodingKeys: String, CodingKey {
        case documentId
        case displayName = "display_name"
        case externalId = "id"
    }
}

