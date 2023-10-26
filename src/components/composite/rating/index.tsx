import useAppColorMode from '@hooks/theme/colorMode';
import React from 'react';
import { Rating, AirbnbRating, TapRatingProps } from 'react-native-ratings';

const RatingComponent: React.FC<Partial<Rating & TapRatingProps>> = props => {
    const STAR = require('./star_2.png');

    const { isDarkMode } = useAppColorMode();

    return (
        <AirbnbRating
            size={60}
            reviews={[]}
            reviewSize={20}
            defaultRating={0}
            starImage={STAR}
            selectedColor={isDarkMode ? '#c09129' : '#ffcb2b'}
            {...props}
        />
    );
};

export default RatingComponent;
