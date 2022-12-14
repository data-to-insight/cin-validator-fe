import React, { useState, useEffect } from "react";
import { ReportActionType } from "reducers/ReportReducer";
import { RouteValue, RouteProps } from "Router";
import { Box, Button, Grid, Typography } from "@mui/material";
import { ScrollableFull, HeaderControl } from "./Report.styles";

import {
  SelectableTable,
  ButtonPopover,
  Block,
  PrimaryControls,
} from "@sfdl/sf-mui-components";

import ChildFilterDialog from "components/dialogs/childfilter";
import ReportDetail from "./ReportDetail";
import { Aligner, Spacer } from "../Pages.styles";

interface ReportPageProps extends RouteProps {
  handleRouteChange: (newRoute: RouteValue) => void;
}

const Report = (props: ReportPageProps) => {
  const { handleRouteChange, api, data, dispatch } = props;
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const children = await api.callAPI({ method: "get_children", value: {} });
      const errors = await api.callAPI({ method: "get_errors", value: {} });

      dispatch({
        type: ReportActionType.SET_CHILDREN,
        payload: {
          children: JSON.parse(children.val),
          errors: JSON.parse(errors),
        },
      });
    };

    if (Object.values(data).length < 1) {
      init();
    }
  }, []);

  const handleRowSelect = (row: unknown[]) => {
    setSelectedChild(row[0] as string);
  };

  const handleResetClick = () => {
    dispatch({ type: ReportActionType.RESET, payload: {} });
    handleRouteChange(RouteValue.LOAD_DATA);
  };

  const renderTable = () => {
    if (!data.reportList) {
      return null;
    }

    const reportList = Object.values(data.reportList)
      .filter((reportItem) => {
        return !reportItem.hide;
      })
      .map((reportItem) => {
        return [reportItem.code, reportItem.count];
      });

    return (
      <SelectableTable
        headers={["Code", "Count"]}
        rows={reportList}
        onRowSelect={handleRowSelect}
      />
    );
  };

  const renderDetailView = () => {
    if (selectedChild && data.reportList) {
      const childItem = data.reportList.filter((childItem) => {
        return childItem.code === selectedChild;
      })[0];

      return (
        <ReportDetail api={api} childItem={childItem} dispatch={dispatch} />
      );
    }

    return <Typography variant="h6">Select child</Typography>;
  };

  return (
    <Box flexGrow={1} style={{ height: "750px", overflowY: "hidden" }}>
      <Grid
        container
        spacing={2}
        style={{ height: "700px", overflowY: "hidden" }}
      >
        <Grid item xs={3} style={{ height: "100%" }}>
          <ScrollableFull>
            <HeaderControl>
              <Typography variant="h6">Child ID</Typography>
              <ButtonPopover label="Filter">
                <ChildFilterDialog
                  filterString={data.reportFilter}
                  dispatch={dispatch}
                />
              </ButtonPopover>
            </HeaderControl>
            {renderTable()}
          </ScrollableFull>
        </Grid>
        <Grid item xs={9} style={{ height: "100%" }}>
          {renderDetailView()}
        </Grid>
      </Grid>
      <Block spacing="blockLarge">
        <Spacer>
          <Aligner>
            <PrimaryControls
              disableButtons={false}
              onClearClick={handleResetClick}
              onValidateClick={() => {}}
            />
          </Aligner>
        </Spacer>
      </Block>
    </Box>
  );
};

export default Report;
