import Foundation

enum Pet: Codable {
    case cat(Cat)
    case dog(Dog)

    private enum CodingKeys: String, CodingKey {
        case type
    }

    enum PetType: String, Codable {
        case cat
        case dog
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(PetType.self, forKey: .type)
        switch type {
        case .cat:
            self = .cat(try Cat(from: decoder))
        case .dog:
            self = .dog(try Dog(from: decoder))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .cat(let obj):
            try container.encode(PetType.cat.rawValue, forKey: .type)
            try obj.encode(to: encoder)
        case .dog(let obj):
            try container.encode(PetType.dog.rawValue, forKey: .type)
            try obj.encode(to: encoder)
        }
    }
}

