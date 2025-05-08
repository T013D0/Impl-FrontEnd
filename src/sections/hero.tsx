export const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white text-center p-4">
      <h1 className="text-5xl font-bold mb-4">Welcome to Our Website</h1>
      <p className="text-lg mb-8">
        We are glad to have you here. Explore our features and services.
      </p>
      <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded shadow hover:bg-gray-200 transition duration-300">
        Get Started
      </button>
      <div className="mt-8 flex space-x-4">
        <a
          href="#"
          className="text-white hover:text-gray-200 transition duration-300"
        >
          About Us
        </a>
        <a
          href="#"
          className="text-white hover:text-gray-200 transition duration-300"
        >
          Services
        </a>
        <a
          href="#"
          className="text-white hover:text-gray-200 transition duration-300"
        >
          Contact
        </a>
        <a
          href="#"
          className="text-white hover:text-gray-200 transition duration-300"
        >
          Blog
        </a>
      </div>
    </div>
  );
};
