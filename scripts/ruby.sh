EXPECTED_VERSION=$(cat ios/.ruby-version)

if rbenv versions --bare | grep -q "^${EXPECTED_VERSION}\$";
then
    echo "Ruby ${EXPECTED_VERSION} is already installed."
else 
    echo "Ruby ${EXPECTED_VERSION} is not installed. Installing now..."
    # Install the required Ruby version
    rbenv install "$EXPECTED_VERSION"
fi

# Check if the current Ruby version is the expected version
CURRENT_VERSION=$(rbenv version-name)
if [ "$CURRENT_VERSION" != "$EXPECTED_VERSION" ];
then
    echo "Current Ruby version is not ${EXPECTED_VERSION}. Switching now..."
    # Set the required Ruby version as the global version
    rbenv global "$EXPECTED_VERSION"
else
    echo "Current Ruby version is already ${EXPECTED_VERSION}."
fi