/** @jsxImportSource @emotion/react */

import React, { useState, useReducer } from "react";
import {
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import {
  FormatListBulleted,
  FormatListNumbered,
  TableView,
} from "@mui/icons-material";

import { Pre, Aligner } from "../Pages.styles";

import { ReportAction, ReportActionType } from "reducers/ReportReducer";
import { FileActionType } from "reducers/FileReducer";

import {
  Expando,
  Tabs,
  SelectableList as Selectablelist,
  Loader,
  PrimaryControls,
  Upload as Uploader,
  Block,
} from "@sfdl/sf-mui-components";

import { RouteProps, RouteValue } from "../../Router";

import validationRules from "data/validation-rules-list.json";

interface LoadDataPageProps extends RouteProps {
  handleRouteChange: (route: RouteValue) => void;
}

const years = ["2022/23", "2021/22", "2020/21", "2019/20", "2018/19"];
const las = ["Barking", "Barnet", "Bromley"];

const LoadData = (props: LoadDataPageProps) => {
  const { dispatch, api, fileState, fileDispatch } = props;

  const [collectionYear, setCollectionYear] = useState(years[0]);
  const [localAuthority, setLocalAuthority] = useState(las[0]);
  const [selectedValidationRules, setSelectedValidationRules] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleResetClick = () => {
    dispatch({ type: ReportActionType.RESET, payload: {} });
    fileDispatch({ type: FileActionType.CLEAR_FILES, payload: {}, year: "" });
  };

  const getTotalFilesLength = (): number => {
    return Object.values(fileState).reduce((prevVal, currVal) => {
      return (prevVal as number) + Object.values(currVal as Object).length;
    }, 0) as number;
  };

  const handleNextClick = async () => {
    if (api && fileState) {
      const files: { year: string; file: unknown }[] = [];
      Object.keys(fileState).forEach((year) => {
        Object.values(fileState[year]).forEach((file: any) => {
          files.push({ year, file: file.file });
        });
      });
      try {
        console.log(files, "files...");
        await api.callAPI({ method: "reset", value: {} });
        await api.callAPI({ method: "add_files", value: { files } });
        props.handleRouteChange(RouteValue.REPORT);
      } catch (ex) {
        console.log("API add_files request failed", ex);
        alert("Something went wrong!");
      }
    }
  };
  const renderInstructions = () => {
    const instructions = [
      {
        label: `Add your files to the loading boxes below. If using CSV's, you can
        validate with any or all of the tables, but validation checks which are
        missing the necessary data will not run.`,
        content: null,
      },
      {
        label: `Select your Local Authority and the relevant Collection Year.`,
        content: null,
      },
      {
        label: `If you only want to only run the validation for certain rules, use the
        'Validation Rules' dropdown to select the ones you want.
      `,
        content: null,
      },
      {
        label: `Click 'Validate' to run the selected checks. When complete, the Error
        Display screen will appear.
      `,
        content: null,
      },
      {
        label: `On the Error Display screen:`,
        content: (
          <Typography variant="body2">
            <ul>
              <li>Use the 'Child ID' sidebar to select individual children.</li>
              <li>
                Use the tabs to see the selected Child ID's data in a particular
                module. Cells with errors are highlighted in red.
              </li>
              <li>
                If you click the 'Filter' button, you can type to search for a
                Child ID, or scroll down and click to display only children with
                a particular error.
              </li>
              <li>
                To download the Error Report spreadsheet, scroll to the bottom
                of the page and click the 'Download Error Reports' button
              </li>
            </ul>
          </Typography>
        ),
      },
    ];

    return (
      <Stepper orientation="vertical" activeStep={-1}>
        {instructions.map((ins, idx) => {
          return (
            <Step key={ins.label} active={true}>
              <StepLabel>{ins.label}</StepLabel>
              <StepContent>{ins.content}</StepContent>
            </Step>
          );
        })}
      </Stepper>
    );
  };

  const renderCSVTab = () => {
    return (
      <Box>
        <Block spacing="blockLarge">
          <Expando
            title="Show column headers for each CSV file - these must match exactly"
            id="csv-header-expando"
            Icon={TableView}
          >
            <p>
              <strong>Header:</strong>
              <Pre>CHILD,SEX,DOB,ETHNIC,UPN,MOTHER,MC_DOB</Pre>
            </p>
            <p>
              <strong>Episodes:</strong>
              <Pre>
                CHILD,DECOM,RNE,LS,CIN,PLACE,PLACE_PROVIDER,DEC,REC,REASON_PLACE_CHANGE,HOME_POST,PL_POST,URN
              </Pre>
            </p>
            <p>
              <strong>UASC:</strong>
              <Pre>CHILD,SEX,DOB,DUC</Pre>
            </p>
            <p>
              <strong>Outcomes (OC2):</strong>
              <Pre>
                CHILD,DOB,SDQ_SCORE,SDQ_REASON,CONVICTED,HEALTH_CHECK,IMMUNISATIONS,TEETH_CHECK,HEALTH_ASSESSMENT,SUBSTANCE_MISUSE,INTERVENTION_RECEIVED,INTERVENTION_OFFERED
              </Pre>
            </p>
            <p>
              <strong>Adoption (AD1):</strong>
              <Pre>
                CHILD,DOB,DATE_INT,DATE_MATCH,FOSTER_CARE,NB_ADOPTR,SEX_ADOPTR,LS_ADOPTR
              </Pre>
            </p>
            <p>
              <strong>Should be Placed for Adoption:</strong>
              <Pre>
                CHILD,DOB,DATE_PLACED,DATE_PLACED_CEASED,REASON_PLACED_CEASED
              </Pre>
            </p>
            <p>
              <strong>Care Leavers (OC3):</strong>
              <Pre>CHILD,DOB,IN_TOUCH,ACTIV,ACCOM</Pre>
            </p>
            <p>
              <strong>Reviews:</strong>
              <Pre>CHILD,DOB,REVIEW,REVIEW_CODE</Pre>
            </p>
            <p>
              <strong>Previous Permanence:</strong>
              <Pre>CHILD,DOB,PREV_PERM,LA_PERM,DATE_PERM</Pre>
            </p>
            <p>
              <strong>Missing:</strong>
              <Pre>CHILD,DOB,MISSING,MIS_START,MIS_END</Pre>
            </p>
          </Expando>
        </Block>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6">This year</Typography>
            <Uploader
              onUploadReady={(files) => {
                fileDispatch({
                  type: FileActionType.ADD_FILES,
                  payload: files || {},
                  year: "2022",
                });
              }}
              fileList={fileState["2022"]}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6">Previous year</Typography>
            <Uploader onUploadReady={() => {}} fileList={{}} />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderXMLTab = () => {
    return (
      <Box>
        <Block>
          <p>
            There are known issues with XML loading at present; this may or may
            not work depending on the structure of your file.
          </p>
          <p>
            Please report any issues using the link at the top of this page.
          </p>
        </Block>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6">This year</Typography>
            <Uploader onUploadReady={() => {}} fileList={{}} />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6">Previous year</Typography>
            <Uploader
              onUploadReady={(files) => {
                fileDispatch({
                  type: FileActionType.ADD_FILES,
                  payload: files || {},
                  year: "2022",
                });
              }}
              fileList={fileState["2022"]}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderFileTabs = () => {
    const headers = [
      { label: "CSV Files" },
      { label: "XML Files (Experimental!)" },
    ];

    const bodies = [renderCSVTab(), renderXMLTab()];

    return <Tabs headers={headers} bodies={bodies} id="file-upload-tabs" />;
  };

  const getValidationRulesSummary = () => {
    const totalRulesLength = validationRules.length;
    const selectedRulesLength = selectedValidationRules.length;
    const unselectedRulesLength = totalRulesLength - selectedRulesLength;

    return `${selectedRulesLength} selected, ${unselectedRulesLength} unselected`;
  };

  return (
    <div>
      {loading && <Loader type="cover" />}
      <Box flexGrow={1}>
        <Block>
          This tool will load Python code in your web browser to read and
          validate your SSDA903 data files locally. None of your SSDA903 data
          will leave your network via this tool. You can safely use it without
          installing additional software, and without any data sharing
          agreement. Once the Python code has loaded, the tool will work
          entirely offline.
        </Block>
        <Block spacing="blockLarge">
          To begin, use the boxes below to locate your local SSDA903 file
          outputs for the relevant year. Choose which validation rules you want
          to run, and use the ???Validate??? button to get started.
        </Block>
        <Block spacing="blockLarge">
          <Expando
            Icon={FormatListNumbered}
            id="instructions-list"
            title="Instructions"
          >
            {renderInstructions()}
          </Expando>
        </Block>
        <Block>
          <Block>
            <Typography variant="h5">
              Offsted provider information lookup tables
            </Typography>
          </Block>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h6">Children's Homes List</Typography>
              <Uploader onUploadReady={() => {}} fileList={{}} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">Social Care Providers List</Typography>
              <Uploader onUploadReady={() => {}} fileList={{}} />
            </Grid>
          </Grid>
        </Block>
        <Block spacing="blockLarge">
          <Box>{renderFileTabs()}</Box>
        </Block>
        <Block>
          <Grid container columnSpacing={2}>
            <Grid item xs={6}>
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="select-collection-year-label">
                  Collection Year
                </InputLabel>
                <Select
                  labelId="select-collection-year-label"
                  id="select-collection-year"
                  value={collectionYear}
                  label="Collection Year"
                  onChange={(evt: SelectChangeEvent) => {
                    setCollectionYear(evt.target.value);
                  }}
                >
                  {years.map((year, idx) => {
                    return (
                      <MenuItem value={year} key={`collection-year-${year}`}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="select-local-authority-label">
                  Local Authority
                </InputLabel>
                <Select
                  labelId="select-local-authority-label"
                  id="select-local-authority"
                  value={localAuthority}
                  label="Local Authority"
                  onChange={(evt: SelectChangeEvent) => {
                    setLocalAuthority(evt.target.value);
                  }}
                >
                  {las.map((year, idx) => {
                    return (
                      <MenuItem value={year} key={`collection-year-${year}`}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Block>
        <Block spacing="blockLarge">
          <Expando
            defaultExpanded={false}
            Icon={FormatListBulleted}
            id="validation-rules-expander"
            title={`Validation Rules (${getValidationRulesSummary()})`}
          >
            <Selectablelist
              values={validationRules}
              onItemSelected={(selectedRules: string[]) => {
                setSelectedValidationRules(selectedRules);
              }}
            />
          </Expando>
        </Block>
        <Block spacing="blockLarge">
          <Aligner>
            <PrimaryControls
              disableButtons={getTotalFilesLength() < 1}
              onClearClick={handleResetClick}
              onValidateClick={handleNextClick}
            />
          </Aligner>
        </Block>
      </Box>
    </div>
  );
};

export default LoadData;
