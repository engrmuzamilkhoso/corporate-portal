import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Login from '../page'; // Adjust the path as needed
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/AuthContext'; // Path to your AuthProvider

// Mock Axios
jest.mock('../../../../utils/axios', () => ({
  post: jest.fn(),
}));

// Mock Next.js useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Login Component', () => {
  let mockRouterPush: jest.Mock;
  let mockApi: any;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    mockApi = require('../../../../utils/axios');

    // Mock the useRouter hook's push function
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and navigate to the dashboard', async () => {
    // Mock Axios response for a successful login
    mockApi.post.mockResolvedValueOnce({
      data: { status: '0000', isExpired: false, token: '123' },
    });

    // Render the Login component within the AuthProvider
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'muhammad.atif@simpaisa.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'Admin123@' },
    });

    // Simulate clicking the Login button
    fireEvent.click(screen.getByText('Login'));

    // Wait for the API call and router navigation to complete
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith(
        'auth/v3/login',
        expect.objectContaining({
          email: 'muhammad.atif@simpaisa.com',
          password: 'Admin123@',isCorporate: true,
        })
      );

      expect(mockApi.post).toHaveReturnedWith(
        Promise.resolve({
          data: { status: '0000', isExpired: true },
        })
      );
    });
  });
});
