import Share from 'react-native-share';

export const openFile = (downloadedFilePath: string) => {
    if (downloadedFilePath) {
        Share.open({ url: `file://${downloadedFilePath}`, title: 'Open File' }).catch(error => {});
    }
};
