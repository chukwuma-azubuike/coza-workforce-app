import React from 'react';
import { Rating, AirbnbRating, TapRatingProps } from 'react-native-ratings';

const RatingComponent: React.FC<Partial<Rating & TapRatingProps>> = props => {
    return <AirbnbRating {...props} />;
};

export default RatingComponent;
