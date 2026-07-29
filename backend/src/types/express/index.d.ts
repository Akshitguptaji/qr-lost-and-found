export {};
declare global {
  // we r decalring the rules golbally for the entire project

  namespace Express {
    //this is the target , means in which place i want to change
    interface Request {
      //just adding userID inside the Request
      userId?: string;
    }
  }
}

//

// i ffile does not have the import or expport than the file will not execute
// so we put a dummy export here
//  export {}; is just a dummy line that forces TypeScript to treat the file correctly.
//warning:-we r just changing the ts rules not the actual express
