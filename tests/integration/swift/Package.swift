// swift-tools-version:5.9
//
// Integration test package for typesync's Swift generator.
//
// The library target wraps generated source written into `Sources/Generated/`
// by the runner script. The test target verifies that the generated types
// round-trip through the Firestore emulator using the official Firebase iOS
// SDK.
//
// Pinned to firebase-ios-sdk 10.17+ so that the @DocumentID property wrapper
// (and the rest of the Codable/Swift extensions) live in the FirebaseFirestore
// module directly, avoiding the deprecated FirebaseFirestoreSwift module.

import PackageDescription

let package = Package(
    name: "TypesyncIntegration",
    platforms: [
        .macOS(.v12),
        .iOS(.v15),
    ],
    products: [
        .library(
            name: "TypesyncIntegration",
            targets: ["TypesyncIntegration"]
        ),
    ],
    dependencies: [
        .package(
            url: "https://github.com/firebase/firebase-ios-sdk.git",
            from: "10.29.0"
        ),
    ],
    targets: [
        .target(
            name: "TypesyncIntegration",
            dependencies: [
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
            ],
            path: "Sources/TypesyncIntegration"
        ),
        .testTarget(
            name: "TypesyncIntegrationTests",
            dependencies: ["TypesyncIntegration"],
            path: "Tests/TypesyncIntegrationTests"
        ),
    ]
)
