/** Posts tab of the signed-in user's own profile: heading, empty state and post tile grid. */
import { Image as ImageIcon } from "lucide-react";
import PostTileGridShimmering from "../shimmering/PostTileGridShimmering";
import ProfilePostGrid from "./ProfilePostGrid";
import { ProfileEmptyAction, ProfileEmptyState, ProfileSectionHeading } from "./ProfileSection";

export default function OwnProfilePostsTab({ user, posts, loadingPosts }) {
    return (
        <section>
            <ProfileSectionHeading title="My Posts" count={posts.length} />

            {posts.length > 0 ? (
                <ProfilePostGrid user={user} posts={posts} />
            ) : loadingPosts ? (
                <PostTileGridShimmering />
            ) : (
                <ProfileEmptyState
                    icon={ImageIcon}
                    title="No posts yet"
                    hint="Share a photo, a video or a thought and it will show up here."
                    action={<ProfileEmptyAction to="/create/post">Create a post</ProfileEmptyAction>}
                />
            )}
        </section>
    );
}
