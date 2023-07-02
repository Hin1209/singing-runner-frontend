import { gql } from "@apollo/client";

export const GET_USER_REPLAYS = gql`
  query GetUserReplays(
    $userId: String!
    $pageNumber: Int!
    $isMyReplay: Boolean!
  ) {
    getUserReplays(
      userId: $userId
      pageNumber: $pageNumber
      isMyReplay: $isMyReplay
    ) {
      replayId
      songTitle
      singer
      createdAt
      isPublic
    }
  }
`;

export const UPDATE_PUBLIC = gql`
  mutation UpdateReplayIsPublic($replayId: Int!, $isPublic: Int!) {
    updateReplayIsPublic(replayId: $replayId, isPublic: $isPublic) {
      replayId
      isPublic
    }
  }
`;

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
      userTier
    }
  }
`;

export const UPDATE_CHARACTER = gql`
  mutation UpdateCharacter($userId: String!, $character: String!) {
    updateCharacter(userId: $userId, character: $character) {
      userId
      character
    }
  }
`;
