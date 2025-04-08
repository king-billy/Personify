> [!NOTE]
> This is a group project for COMPSCI 520.

## 1. Requirements

### 1.1 Overview

We aim to develop an application that provides **personalized personality insights** based on users' Spotify listening habits. By integrating the open-source **Spotify API** with a machine learning model we plan to develop, our app will analyze a user's listening history to discover patterns and categorize their musical "vibes."

### 1.2 Features

- A **user interface** designed to analyze and showcase a user’s music personality with a simple, intuitive click.
- Instant discovery of a user’s **music personality**, based on listening habits, preferences, and emotional patterns derived from their music consumption.
- A **detailed breakdown of moods or emotional states** tied to music choices, with explanations of how the model derived these insights.
- **Personalized music recommendations**, including top songs, albums, and playlists that align with identified moods or vibes.
- A **"look back" feature** to visualize how a user's musical vibes and moods have evolved over time.
- An **interactive feedback option** for users to rate the accuracy of insights, helping improve the model.
- **Social sharing features** to allow users to share their personality profiles or curated playlists.

### 1.3 Functional Requirements (Use Cases)

1. **Authentication**  
   As a user, I want to log in using my Spotify credentials so I can securely access the application without creating a separate account. The app should request appropriate permissions and notify me if the login fails.

2. **Retrieving and Processing Listening History**  
   The app should access and process my listening history, including tracks, artists, genres, and timestamps, to provide personalized insights based on patterns in my behavior.

3. **Categorizing Musical Preferences**  
   I want to view personality insights derived from my listening history in a visually engaging, easy-to-understand format (charts, infographics).

4. **User Feedback on Insights**  
   I want to provide feedback on the insights (e.g., “This matches my personality”) so the app can improve its accuracy over time.

5. **Customization**  
   I want to select specific time ranges or playlists for analysis so that insights reflect my listening behavior more accurately. A compact slider should allow me to do this easily.

6. **Exporting and Sharing**  
   I want to export or share my insights via a share button that generates reports for social media or direct links.

7. **Comparing Trends**  
   I want to compare my insights with others (e.g., “Your songs are more upbeat than 60% of users!”), using clear visualizations.

8. **Managing Users (Admin only)**  
   As an admin, I want to create, update, or deactivate user accounts via a secure admin interface.

### 1.4 Non-Functional Requirements

- **Performance**  
  The application should process data and return insights within **2 to 5 seconds**, using optimized queries, caching, and efficient data pipelines.

- **Scalability**  
  The system must handle multiple concurrent users without significant performance loss, using horizontal scaling and cloud infrastructure.

- **Security and Privacy**  
  User data must be encrypted in transit and at rest. We will comply with Spotify’s API policies, allow users to delete their data, and provide admin-level user controls.

- **Usability and Accessibility**  
  The interface should be intuitive and visually appealing, with accessibility features like screen reader compatibility, color contrast settings, and keyboard navigation.

- **Maintainability and Extensibility**  
  The architecture should be modular and well-documented, allowing for future model updates, new features, and support for other platforms beyond Spotify.

### 1.5 Challenges & Risks

**Privacy & API Limitations**  
We must ensure secure, limited access to user data (only what is necessary: listening history and playlists). API limitations such as rate limits and outdated or sparse data may impact analysis quality. More details on API challenges will be discussed in future development checkpoints.

**Feedback Scope & User Bias**  
User feedback is critical, but we must keep it within scope. Feedback on UX should be addressed, but not at the cost of changing project goals. Mood analysis is subjective, and some songs may be mislabeled or overly influential if repeated often. We'll need a thoughtful approach to how repeated songs are weighted and how mood categories are defined. We aim to go beyond basic insights to offer **unique, thoughtful reflections**, including genre facts or patterns shared with similar users.
