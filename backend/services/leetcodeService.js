const LEETCODE_API = 'https://leetcode.com/graphql';

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
        reputation
      }
      badges {
        name
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      userCalendar {
        streak
        totalActiveDays
      }
    }
  }
`;

const CONTEST_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      rating
      attendedContestsCount
    }
  }
`;

/**
 * Fetches a user's LeetCode profile data via the public GraphQL API.
 * @param {string} username
 * @returns {Promise<object>} normalized user data
 */
export async function fetchLeetCodeUser(username) {
  // Fetch profile + contest data in parallel
  const [profileRes, contestRes] = await Promise.all([
    fetch(LEETCODE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: USER_PROFILE_QUERY, variables: { username } }),
    }),
    fetch(LEETCODE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CONTEST_QUERY, variables: { username } }),
    }),
  ]);

  const profileData = await profileRes.json();
  const contestData = await contestRes.json();

  const user = profileData?.data?.matchedUser;
  if (!user) {
    throw new Error(`LeetCode user "${username}" not found`);
  }

  const contest = contestData?.data?.userContestRanking;

  // Parse submission stats
  const statsMap = {};
  (user.submitStatsGlobal?.acSubmissionNum || []).forEach((s) => {
    statsMap[s.difficulty] = s.count;
  });

  return {
    username: user.username,
    profile: {
      realName: user.profile?.realName || '',
      avatar: user.profile?.userAvatar || '',
      ranking: user.profile?.ranking || 0,
      reputation: user.profile?.reputation || 0,
    },
    solvedStats: {
      total: statsMap['All'] || 0,
      easy: statsMap['Easy'] || 0,
      medium: statsMap['Medium'] || 0,
      hard: statsMap['Hard'] || 0,
    },
    contestRating: contest?.rating ? Math.round(contest.rating) : 0,
    contestsAttended: contest?.attendedContestsCount || 0,
    badges: (user.badges || []).map((b) => b.name),
    streak: user.userCalendar?.streak || 0,
    activeDays: user.userCalendar?.totalActiveDays || 0,
  };
}
