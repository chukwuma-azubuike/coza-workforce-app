const fs = require('fs');
const path = require('path');

function processFilesInDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory() && file !== 'node_modules') {
            processFilesInDirectory(filePath); // Recurse into subdirectory (except node_modules)
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            // Read file content and replace 'native-base' with '@gluestack-ui/themed-native-base'
            let fileContent = fs.readFileSync(filePath, 'utf8');
            fileContent = fileContent.replace("from 'native-base'", "from '@gluestack-ui/themed-native-base'");

            // Write modified content back to the file
            fs.writeFileSync(filePath, fileContent, 'utf8');
            console.log(`Processed: ${filePath}`);
        }
    });
}

// Specify the root directory where you want to start the search and replace operation
const rootDirectory = '../';

// Call the function to start processing files in the specified directory
processFilesInDirectory(rootDirectory);
