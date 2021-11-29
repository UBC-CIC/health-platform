import React from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Spinner: React.FC = () => {
  return <FontAwesomeIcon icon={faSpinner} spin size="8x" color="#999999"/>;
};

export default Spinner;