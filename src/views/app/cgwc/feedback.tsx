import React from 'react';
import RatingComponent from '@components/composite/rating';
import { View } from 'react-native';

const CGWCFeedback: React.FC = () => {
    return (
        <View style={{ marginBottom: 80, marginTop: 40 }}>
            <RatingComponent
                size={60}
                reviews={[]}
                reviewSize={20}
                defaultRating={5}
                reviewColor="white"
                selectedColor="green"
            />
        </View>
    );
};

export default CGWCFeedback;
