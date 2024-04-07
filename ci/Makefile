
IMAGE_NAME := seymurkafkas/python-java-gcloud:latest

# Target platform
PLATFORM := linux/amd64

# Define the build context path
BUILD_CONTEXT := executors/python-java-gcloud

# Name of the buildx builder
BUILDER_NAME := mybuilder

build:
	@docker buildx create --use --driver docker-container --name $(BUILDER_NAME)
	@docker buildx build $(BUILD_CONTEXT) \
		--platform $(PLATFORM) \
		--tag $(IMAGE_NAME) \
		--output type=image,name=$(IMAGE_NAME),push=true,compression=zstd \
		--builder $(BUILDER_NAME)

clean:
	@docker buildx rm $(BUILDER_NAME)

.PHONY: build clean
