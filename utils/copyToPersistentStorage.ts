import { File, Paths } from 'expo-file-system';

const copyToPersistentStorage = async (fileUri: string) => {
    const normalizedUri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
    const srcFile = new File(normalizedUri);
    srcFile.copy(Paths.document);
    return new File(Paths.document, srcFile.name).uri;
};

export default copyToPersistentStorage;
