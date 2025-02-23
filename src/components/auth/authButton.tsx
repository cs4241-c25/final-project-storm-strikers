import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SignIn from "./signin";
import { SignOut } from "./signout";

export default async function AuthButton() {
  const session = await auth();
  if (session?.user) {
    return (
      <div className="flex items-center justify-center">
        <Popover>
          <PopoverTrigger className="flex items-center">
            <Avatar>
              <AvatarImage src={session.user.image ?? ""} />
              <AvatarFallback>{session.user.name}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent>
            <SignOut />
          </PopoverContent>
        </Popover>
      </div>
    );
  } else {
    return SignIn();
  }
}
