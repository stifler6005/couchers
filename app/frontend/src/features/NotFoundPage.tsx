import { Box, Link as MuiLink } from "@material-ui/core";
import TextBody from "components/TextBody";
import { DO_YOU_WANT, GO_HOME, NOT_FOUND } from "features/constants";
import { Link } from "react-router-dom";
import Graphic from "resources/404graphic.png";
import { baseRoute } from "routes";
import makeStyles from "utils/makeStyles";

const useStyles = makeStyles({
  graphic: {
    height: "75%",
    width: "75%",
  },
  root: {
    left: "50%",
    position: "absolute",
    textAlign: "center",
    top: "50%",
    transform: "translate(-50%,-50%)",
  },
});

export default function NotFoundPage() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <img
        src={Graphic}
        alt="404 Error: Resource Not Found"
        className={classes.graphic}
      ></img>
      <TextBody>{NOT_FOUND}</TextBody>
      {DO_YOU_WANT}
      <MuiLink component={Link} to={baseRoute}>
        {GO_HOME}
      </MuiLink>
    </Box>
  );
}
