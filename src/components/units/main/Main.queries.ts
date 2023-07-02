import { gql } from "@apollo/client";

export const FETCH_USER = gql`
  query FetchUser {
    fetchUser {
      userId
      userEmail
      nickname
      userActive
      userKeynote
      userMmr
      userPoint
      character
    }
  }
`;
