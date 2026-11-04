/** Posts tab of another user's public profile: heading, empty state and post tile grid. */
import { Image as ImageIcon } from "lucide-react";
import PostTileGridShimmering from "../shimmering/PostTileGridShimmering";
import ProfilePostGrid from "./ProfilePostGrid";
import { ProfileEmptyState, ProfileSectionHeading } from "./ProfileSection";

export default function PublicProfilePostsTab({ user, posts, loadingPosts }) {
    return (
        <section>
            <ProfileSectionHeading title="Recent Posts" count={posts.length} />

            {posts.length > 0 ? (
                <ProfilePostGrid user={user} posts={posts} />
            ) : loadingPosts ? (
                <PostTileGridShimmering />
            ) : (
                <ProfileEmptyState
                    icon={ImageIcon}
                    title="No posts yet"
                    hint={`When ${user.firstname ? `${user.firstname} shares` : "they share"} something, it will show up here.`}
                />
            )}
        </section>
    );
}
