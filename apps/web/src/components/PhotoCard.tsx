
import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { getPhotoThumbUrl, deletePhoto, updatePhotoStatus, updatePhoto } from '@/lib/db';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface PhotoCardProps {
    photo: any;
    currentUserId?: string;
    currentUserAvatar?: string;
    eventOwnerId?: string;
    animationDelay?: number;
}

export default function PhotoCard({ photo, currentUserId, currentUserAvatar, eventOwnerId, animationDelay = 0, onPhotoClick }: PhotoCardProps & { animationDelay?: number; onPhotoClick?: () => void }) {
    const { enqueueSnackbar } = useSnackbar();
    const url = getPhotoThumbUrl(photo);
    const isOwner = currentUserId && currentUserId === photo.owner;
    const ownerName = isOwner ? 'You' : (photo.owner_name || 'Guest');
    const ownerAvatar = photo.owner_avatar || (isOwner ? currentUserAvatar : '');

    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(photo.caption || '');

    // Manage animation classes
    const [animationClass, setAnimationClass] = useState("animate-fade-in");
    const [highlight, setHighlight] = useState(false);

    // Remove fade-in after it completes so it doesn't conflict with flash or restart
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationClass("");
        }, 1000 + animationDelay);
        return () => clearTimeout(timer);
    }, [animationDelay]);

    // Flash Highlight Logic
    useEffect(() => {
        if (photo.updated && photo.updated !== photo.created) {
            const timer1 = setTimeout(() => setHighlight(true), 0);
            const timer2 = setTimeout(() => setHighlight(false), 1000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [photo.updated, photo.created, photo.likes, photo.caption]);

    const canDelete = isOwner;
    const canEdit = isOwner;

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePhoto(photo.id);
            setIsDeleting(false);
        } catch (err) {
            console.error(err);
            enqueueSnackbar("Failed to delete photo", { variant: 'error' });
            setIsDeleting(false);
        }
    };

    const handleUpdateCaption = async () => {
        try {
            await updatePhoto(photo.id, { caption: caption });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            enqueueSnackbar("Failed to update caption", { variant: 'error' });
        }
    };

    // Likes logic - normalize to string[]
    const rawLikes = photo.likes;
    let likes: string[] = [];

    if (Array.isArray(rawLikes)) {
        likes = rawLikes;
    } else if (typeof rawLikes === 'string' && rawLikes.trim() !== '') {
        likes = [rawLikes];
    }

    likes = [...new Set(likes)];

    const isLiked = currentUserId ? likes.includes(currentUserId) : false;
    const likeCount = likes.length;

    const handleLike = async () => {
        if (!currentUserId) return;

        const newLikes = isLiked
            ? likes.filter((id: string) => id !== currentUserId)
            : [...likes, currentUserId];

        try {
            await updatePhoto(photo.id, { likes: newLikes });
        } catch (err) {
            console.error("Like failed", err);
        }
    };



    // Combining classes
    const finalClass = `mb-4 break-inside-avoid rounded-lg overflow-hidden shadow-lg bg-gray-800 relative group transition-all border border-transparent ${animationClass} ${highlight ? 'animate-flash' : ''} ${photo._isExiting ? 'animate-fade-out' : ''}`;

    return (
        <div className={finalClass} style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}>
            <div
                className="relative w-full cursor-pointer"
                onClick={() => {
                    if (onPhotoClick) {
                        onPhotoClick();
                    }
                }}
            >
                {/* Fallback to standard img to debug URL/NextConfig issues */}
                <img
                    src={url}
                    alt={photo.caption || "Event photo"}
                    className="w-full h-auto max-h-[500px] object-cover"
                    loading="lazy"
                />

                <div className="absolute top-2 right-2 flex gap-2">
                    {/* Controls need to stop propagation so they don't trigger the photo click */}
                    {canEdit && !isEditing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                                setCaption(photo.caption || '');
                            }}
                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm"
                            title="Edit Caption"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                    {canDelete && !isEditing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm"
                            title="Delete Photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Like Button (Always Visible) */}
                {!isEditing && (
                    <div className="absolute bottom-2 right-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLike();
                            }}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors backdrop-blur-sm ${isLiked
                                ? "bg-red-500/90 text-white"
                                : "bg-black/40 text-white hover:bg-black/60"
                                } `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLiked ? "fill-current" : ""} `} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{likeCount}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Always show footer now that we have timestamp/user info */}
            <div className="p-3 relative">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full bg-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows={2}
                            placeholder="Add a caption..."
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 text-xs">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCaption}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {photo.caption && <p className="text-sm text-white mb-1">{photo.caption}</p>}
                        <div className="flex justify-between items-end text-xs text-gray-400">
                            <span className="flex items-center gap-1.5 min-w-0">
                                {ownerAvatar ? (
                                    <img
                                        src={ownerAvatar}
                                        alt={ownerName}
                                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                                        {ownerName.replace('You', 'Me').substring(0, 2).toUpperCase()}
                                    </span>
                                )}
                                <span className="truncate">by {ownerName}</span>
                            </span>
                            <span className="flex-shrink-0">{dayjs(photo.created).fromNow()}</span>
                        </div>
                    </>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm border border-gray-800 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Delete Photo?</h2>
                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this photo? This action cannot be undone.</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleting(false)}
                                className="text-gray-400 hover:text-white px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
