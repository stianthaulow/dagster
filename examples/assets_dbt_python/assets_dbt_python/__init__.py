import os

from dagster import (
    Definitions,
    FilesystemIOManager,
    ScheduleDefinition,
    define_asset_job,
    load_assets_from_package_module,
)
from dagster._core.definitions.asset_check_factories.freshness_checks.sensor import (
    build_sensor_for_freshness_checks,
)
from dagster_duckdb_pandas import DuckDBPandasIOManager

from .assets import forecasting, raw_data
from .assets.dbt import DBT_PROJECT_DIR, dbt_project_assets, dbt_resource

raw_data_assets = load_assets_from_package_module(
    raw_data,
    group_name="raw_data",
    # all of these assets live in the duckdb database, under the schema raw_data
    key_prefix=["duckdb", "raw_data"],
)

forecasting_assets = load_assets_from_package_module(
    forecasting,
    group_name="forecasting",
)
all_assets_checks = [*forecasting.forecasting_freshness_checks]

# The freshness check sensor will run our freshness checks even if the underlying asset fails to run, for whatever reason.
freshness_check_sensor = build_sensor_for_freshness_checks(freshness_checks=all_assets_checks)

# define jobs as selections over the larger graph
everything_job = define_asset_job("everything_everywhere_job", selection="*")
forecast_job = define_asset_job("refresh_forecast_model_job", selection="*order_forecast_model")

resources = {
    # this io_manager allows us to load dbt models as pandas dataframes
    "io_manager": DuckDBPandasIOManager(database=os.path.join(DBT_PROJECT_DIR, "example.duckdb")),
    # this io_manager is responsible for storing/loading our pickled machine learning model
    "model_io_manager": FilesystemIOManager(),
    # this resource is used to execute dbt cli commands
    "dbt": dbt_resource,
}

defs = Definitions(
    assets=[dbt_project_assets, *raw_data_assets, *forecasting_assets],
    resources=resources,
    asset_checks=all_assets_checks,
    schedules=[
        ScheduleDefinition(job=everything_job, cron_schedule="@weekly"),
        ScheduleDefinition(job=forecast_job, cron_schedule="@daily"),
    ],
    sensors=[freshness_check_sensor],
)
