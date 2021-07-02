import { config, createSchema } from '@keystone-next/keystone/schema';
import { User } from './schemas/User';
import { CartItem } from './schemas/CartItem';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import 'dotenv/config';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations/index';
const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO : add in initial roles
  },
  passwordResetLink: {
    async sendToken(args) {
      console.log(args);
      // send email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    // @ts-ignore
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      // schemas item go in here
      User,
      Product,
      ProductImage,
      CartItem,
    }),
    extendGraphqlSchema,
    ui: {
      // TODO : change this for roles
      isAccessAllowed: ({ session }) => {
        return !!session?.data;
      },
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id email name`,
    }),
  })
);
