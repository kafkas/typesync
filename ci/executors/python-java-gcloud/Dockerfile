FROM python:3.10-slim

ENV JAVA_HOME=/usr/lib/jvm/jdk-21
ENV PATH="$JAVA_HOME/bin:$PATH"

RUN apt-get update \
    && apt-get install -y curl gnupg2 \
    && curl -L -o jdk-21_linux-x64_bin.deb https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.deb \
    && dpkg -i jdk-21_linux-x64_bin.deb \
    && rm -rf jdk-21_linux-x64_bin.deb \
    && curl -sSL https://install.python-poetry.org | python3 -

RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -  \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    &&  apt-get update \
    &&  apt-get install google-cloud-cli google-cloud-cli-firestore-emulator -y

ENV PATH="/root/.local/bin:$PATH"