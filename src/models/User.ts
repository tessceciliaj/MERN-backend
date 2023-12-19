import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  userName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Standard beteende, plockar inte ut lösenordet 
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hook - Varje gång vi sparar en användare så kollar vi om lösenordet är uppdaterat.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  const passwordHash = await bcrypt.hash(this.password, 10);
  this.password = passwordHash;
});

const User = model<IUser>("User", UserSchema);

export default User;
