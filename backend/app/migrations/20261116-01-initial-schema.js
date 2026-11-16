// Baseline: the schema the app had when it still used sequelize.sync().
// Databases created by sync() already have it, so this step is skipped
// for them; it only runs on an empty database.

const SCHEMA = `
CREATE TYPE public."enum_friendRequests_status" AS ENUM (
    'pending',
    'accepted',
    'rejected'
);
CREATE TABLE public.comments (
    "commentId" integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    "parentId" integer,
    content text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public."comments_commentId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."comments_commentId_seq" OWNED BY public.comments."commentId";
CREATE TABLE public."friendRequests" (
    "requestId" integer NOT NULL,
    "senderId" integer NOT NULL,
    "receiverId" integer NOT NULL,
    status public."enum_friendRequests_status" DEFAULT 'pending'::public."enum_friendRequests_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public."friendRequests_requestId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."friendRequests_requestId_seq" OWNED BY public."friendRequests"."requestId";
CREATE TABLE public.friends (
    "friendshipId" integer NOT NULL,
    "userId" integer NOT NULL,
    "friendId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public."friends_friendshipId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."friends_friendshipId_seq" OWNED BY public.friends."friendshipId";
CREATE TABLE public.likes (
    "likeId" integer NOT NULL,
    "userId" integer NOT NULL,
    "postId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public."likes_likeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."likes_likeId_seq" OWNED BY public.likes."likeId";
CREATE TABLE public.messages (
    "messageId" integer NOT NULL,
    "senderId" integer NOT NULL,
    "receiverId" integer NOT NULL,
    message character varying(255) NOT NULL,
    "createdAt" timestamp with time zone
);
CREATE SEQUENCE public."messages_messageId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."messages_messageId_seq" OWNED BY public.messages."messageId";
CREATE TABLE public.posts (
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    content character varying(255),
    image character varying(255),
    "likeCount" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public."posts_postId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."posts_postId_seq" OWNED BY public.posts."postId";
CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE TABLE public.user_roles (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "roleId" integer NOT NULL,
    "userId" integer NOT NULL
);
CREATE TABLE public.users (
    id integer NOT NULL,
    fname character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    pfp character varying(255),
    "coverPhoto" character varying(255),
    "onlineStatus" character varying(255) DEFAULT 'online'::character varying,
    job character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.comments ALTER COLUMN "commentId" SET DEFAULT nextval('public."comments_commentId_seq"'::regclass);
ALTER TABLE ONLY public."friendRequests" ALTER COLUMN "requestId" SET DEFAULT nextval('public."friendRequests_requestId_seq"'::regclass);
ALTER TABLE ONLY public.friends ALTER COLUMN "friendshipId" SET DEFAULT nextval('public."friends_friendshipId_seq"'::regclass);
ALTER TABLE ONLY public.likes ALTER COLUMN "likeId" SET DEFAULT nextval('public."likes_likeId_seq"'::regclass);
ALTER TABLE ONLY public.messages ALTER COLUMN "messageId" SET DEFAULT nextval('public."messages_messageId_seq"'::regclass);
ALTER TABLE ONLY public.posts ALTER COLUMN "postId" SET DEFAULT nextval('public."posts_postId_seq"'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY ("commentId");
ALTER TABLE ONLY public."friendRequests"
    ADD CONSTRAINT "friendRequests_pkey" PRIMARY KEY ("requestId");
ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY ("friendshipId");
ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY ("likeId");
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY ("messageId");
ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY ("postId");
ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY ("roleId", "userId");
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.comments("commentId") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts("postId") ON UPDATE CASCADE;
ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public."friendRequests"
    ADD CONSTRAINT "friendRequests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public."friendRequests"
    ADD CONSTRAINT "friendRequests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.friends
    ADD CONSTRAINT "friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.friends
    ADD CONSTRAINT "friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts("postId") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE;
ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
`;

module.exports = {
  async up({ context: queryInterface }) {
    const tables = (await queryInterface.showAllTables()).map(t => (typeof t === 'string' ? t : t.tableName));
    if (tables.includes('users')) return; // created earlier by sequelize.sync()
    await queryInterface.sequelize.query(SCHEMA);
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS user_roles, likes, comments, messages, "friendRequests", friends, posts, roles, users CASCADE;
      DROP TYPE IF EXISTS "enum_friendRequests_status";
    `);
  }
};
