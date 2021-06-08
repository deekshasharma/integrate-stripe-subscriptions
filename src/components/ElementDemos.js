import React from "react";
import {
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

const ElementDemos = ({ demos }) => {

  return (
    <div className="DemoWrapper">
      <div className="DemoPickerWrapper"/>
      <Switch>
        <Redirect to={demos[0].path} from="/" exact />
        {demos.map(({ path, component: Component }) => (
          <Route key={path} path={path}>
            <div className="Demo">
              <Component />
            </div>
          </Route>
        ))}
      </Switch>
    </div>
  );
};

export default ElementDemos;
