// Base API service with Axios
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL from environment or default to localhost
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Base API service class for making HTTP requests
 */
export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging or auth tokens if needed
    this.api.interceptors.request.use(
      (config) => {
        // You can add auth tokens here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle API errors here
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   * @param url The URL to request
   * @param config Optional Axios config
   * @returns Promise with the response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional Axios config
   * @returns Promise with the response data
   */
  public async post<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional Axios config
   * @returns Promise with the response data
   */
  public async put<T, D = Record<string, unknown>>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   * @param url The URL to request
   * @param config Optional Axios config
   * @returns Promise with the response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
} 