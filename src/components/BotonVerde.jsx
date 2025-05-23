import PropTypes from 'prop-types';

const BotonVerde = ({ text, onClick }) => {
  return (
    <button
      style={{
        backgroundColor: '#64856b',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

BotonVerde.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default BotonVerde;
