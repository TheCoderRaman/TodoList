import Home from "./../Pages/Home";
import Error from "./../Pages/Error";
import SignIn from "./../Pages/SignIn";
import SignUp from "./../Pages/SignUp";
import SignOut from "./../Pages/SignOut";
import TodoList from "./../Pages/User/Tasks/TodoList";
import TodoListContextProvider from "./../Pages/User/Tasks/Contexts/TodoListContext";

/**
 * All application will be defined here.
 * 
 * @var const routes
 */
export const routes = {
    home: {
        name: "Home",
        auth: false,
        path: "/",
        element: <Home />
    },
    signIn: {
        name: "Sign In",
        auth: false,
        path: "/sign-in",
        element: <SignIn />
    },
    signUp: {
        name: "Sign Up",
        auth: false,
        path: "/sign-up",
        element: <SignUp />
    },
    signOut: {
        name: "Sign Out",
        auth: false,
        path: "/sign-out",
        element: <SignOut />
    },
    todoList: {
        name: "Todo List",
        auth: true,
        path: "/user/todo-list",
        element: (
          <TodoListContextProvider>
              <TodoList />
          </TodoListContextProvider>
        )
    },
    error: {
        name: "Error",
        auth: false,
        path: "*",
        element: <Error />
    }
};