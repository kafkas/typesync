import Foundation
import FirebaseFirestore

struct Project: Codable {
    @DocumentID var documentId: String?
    /// Caller-supplied identifier; not the document path id.
    var id: String
    var name: String
}

