import Foundation
import FirebaseFirestore

struct Org: Codable {
    @DocumentID var documentId: String?
    var name: String
}

