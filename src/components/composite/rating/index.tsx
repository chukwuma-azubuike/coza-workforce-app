import React from 'react';
import { Rating, AirbnbRating, TapRatingProps } from 'react-native-ratings';

const RatingComponent: React.FC<Partial<Rating & TapRatingProps>> = props => {
    const STAR = require('./star_2.png');

    return (
        <AirbnbRating
            size={60}
            reviews={[]}
            reviewSize={20}
            defaultRating={0}
            starImage={STAR}
            selectedColor="#c09129"
            {...props}
        />
    );
};

export default RatingComponent;
