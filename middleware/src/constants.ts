export const SPOTIFY_SCOPES: string[] = [
	"playlist-read-collaborative",
	"playlist-read-private",
	"user-follow-read",
	"user-library-read",
	"user-read-currently-playing",
	"user-read-email",
	"user-read-playback-position",
	"user-read-playback-state",
	"user-read-private",
	"user-read-recently-played",
	"user-top-read",
] as const;

export type SpotifyOAuthScope = (typeof SPOTIFY_SCOPES)[number];
