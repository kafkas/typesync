import Foundation

enum StringOrInt: Codable {
    case variant1(String)
    case variant2(Int)

    private enum CodingKeys: String, CodingKey {
        case variant1
        case variant2
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let variant1 = try? container.decode(String.self) {
            self = .variant1(variant1)
        } else if let variant2 = try? container.decode(Int.self) {
            self = .variant2(variant2)
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Failed to decode StringOrInt value."))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .variant1(let val):
            try container.encode(val)
        case .variant2(let val):
            try container.encode(val)
        }
    }
}

