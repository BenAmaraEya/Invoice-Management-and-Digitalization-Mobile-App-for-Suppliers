// jest.config.js
module.exports = {
  
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native-async-storage)/)',
      "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@testing-library)"
    ],
    presets: ["@babel/preset-env","react-native"],
    plugins: ["@babel/plugin-transform-modules-commonjs"],
    transform: {
      '\\.[jt]sx?$': require.resolve('babel-jest'),
    },
    moduleNameMapper: {
      '^@react-native-community/(.*)$': '@react-native-community/$1',
    },
    setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],

  
    setupFilesAfterEnv: ['@testing-library/react-native/jest-preset'],
   
    
  };
  