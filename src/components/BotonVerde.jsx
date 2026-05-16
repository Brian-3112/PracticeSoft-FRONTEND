import PropTypes from 'prop-types';

const BotonVerde = ({ text, onClick }) => {
  return (
    <button
      style={{
        background: 'linear-gradient(135deg, #ff2d2d, #ff7a00)',
        boxShadow: '0 12px 28px rgba(255, 74, 0, 0.28)',
        fontWeight: '900',
        color: 'white',
        padding: '0.55rem 1.1rem',
        border: '1px solid rgba(255, 122, 0, 0.75)',
        borderRadius: '999px',
        height: '40px',
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: '0.035em',
        textTransform: 'uppercase',
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
