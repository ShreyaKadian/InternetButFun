import React from 'react';
import PropTypes from 'prop-types';

const ErrorPage = ({ errorType }) => {
  const errorConfig = {
    serverError: {
      title: "Oops! Something Broke 😿",
      message: "Our servers are having a little catnap. Please try again soon!",
      emoji: "🐾",
    },
    notFound: {
      title: "User Not Found 😕",
      message: "Looks like this user got lost in the digital jungle. Check the username or try another!",
      emoji: "🌴",
    },
    unauthorized: {
      title: "Pssst! Login Required 🔒",
      message: "You need to be logged in to access this page. Sign in and join the fun!",
      emoji: "🦁",
    },
    networkError: {
      title: "Connection Trouble 🐢",
      message: "Your internet seems to be on a coffee break. Check your connection and try again!",
      emoji: "☕",
    },
  };

  const { title, message, emoji } = errorConfig[errorType] || errorConfig.serverError;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="text-6xl animate-bounce">{emoji}</div>
      <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mt-4">{title}</h1>
      <p className="text-lg md:text-xl text-gray-600 mt-2 text-center max-w-md">{message}</p>
      <button
        className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );
};

ErrorPage.propTypes = {
  errorType: PropTypes.oneOf(['serverError', 'notFound', 'unauthorized', 'networkError']).isRequired,
};

export default ErrorPage;