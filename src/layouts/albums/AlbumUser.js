import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Icon,
  Header,
  Dropdown,
  Loader,
  Popup,
  Confirm,
  Label,
  Modal,
  Button,
  Input,
} from "semantic-ui-react";
import { Grid, AutoSizer } from "react-virtualized";
import {
  fetchUserAlbumsList,
  renameUserAlbum,
  deleteUserAlbum,
} from "../../actions/albumsActions";
import { Link } from "react-router-dom";
import { Tile } from "../../components/Tile";
import { TOP_MENU_HEIGHT } from "../../ui-constants";

var SIDEBAR_WIDTH = 85;

export class AlbumUser extends Component {
  state = { newAlbumTitle: "" };
  constructor() {
    super();
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      entrySquareSize: 200,
      openDeleteDialog: false,
      openRenameDialog: false,
      albumID: "",
      albumTitle: "",
      newAlbumTitle: "",
    });

    this.calculateEntrySquareSize = this.calculateEntrySquareSize.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
  }
  openDeleteDialog = (albumID, albumTitle) =>
    this.setState({
      openDeleteDialog: true,
      albumID: albumID,
      albumTitle: albumTitle,
    });
  openRenameDialog = (albumID, albumTitle) =>
    this.setState({
      openRenameDialog: true,
      albumID: albumID,
      albumTitle: albumTitle,
    });
  closeDeleteDialog = () => this.setState({ openDeleteDialog: false });
  closeRenameDialog = () => this.setState({ openRenameDialog: false });
  componentWillMount() {
    this.calculateEntrySquareSize();
    window.addEventListener("resize", this.calculateEntrySquareSize.bind(this));
    if (this.props.albumsUserList.length === 0) {
      this.props.dispatch(fetchUserAlbumsList());
    }
  }

  calculateEntrySquareSize() {
    var numEntrySquaresPerRow = 6;
    if (window.innerWidth < 600) {
      numEntrySquaresPerRow = 2;
    } else if (window.innerWidth < 800) {
      numEntrySquaresPerRow = 3;
    } else if (window.innerWidth < 1000) {
      numEntrySquaresPerRow = 4;
    } else if (window.innerWidth < 1200) {
      numEntrySquaresPerRow = 5;
    }

    var columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 15;

    var entrySquareSize = columnWidth / numEntrySquaresPerRow;
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      entrySquareSize: entrySquareSize,
      numEntrySquaresPerRow: numEntrySquaresPerRow,
    });
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    var albumUserIndex =
      rowIndex * this.state.numEntrySquaresPerRow + columnIndex;
    if (albumUserIndex < this.props.albumsUserList.length) {
      return (
        <div key={key} style={style}>
          <div style={{ padding: 5 }}>
            <Link
              to={`/useralbum/${this.props.albumsUserList[albumUserIndex].id}`}
            >
              <Tile
                video={
                  this.props.albumsUserList[albumUserIndex].cover_photos[0]
                    .video === true
                }
                height={this.state.entrySquareSize - 10}
                width={this.state.entrySquareSize - 10}
                image_hash={
                  this.props.albumsUserList[albumUserIndex].cover_photos[0]
                    .image_hash
                }
              ></Tile>
            </Link>
            <Label
              style={{ backgroundColor: "transparent" }}
              attached="top right"
            >
              <Dropdown
                item
                icon={<Icon color="black" name="ellipsis vertical"></Icon>}
              >
                <Dropdown.Menu>
                  <Dropdown.Item
                    icon="edit"
                    onClick={() =>
                      this.openRenameDialog(
                        this.props.albumsUserList[albumUserIndex].id,
                        this.props.albumsUserList[albumUserIndex].title
                      )
                    }
                    text="Rename"
                  />
                  <Dropdown.Item
                    icon="delete"
                    onClick={() => {
                      this.openDeleteDialog(
                        this.props.albumsUserList[albumUserIndex].id,
                        this.props.albumsUserList[albumUserIndex].title
                      );
                    }}
                    text="Delete"
                  />
                </Dropdown.Menu>
              </Dropdown>
            </Label>
          </div>
          <div
            className="personCardName"
            style={{ paddingLeft: 15, paddingRight: 15, height: 50 }}
          >
            {this.props.albumsUserList[albumUserIndex].shared_to.length > 0 && (
              <Popup
                style={{ padding: 10 }}
                size="tiny"
                position="center right"
                header="Shared with:"
                trigger={<Icon name="users" />}
                content={this.props.albumsUserList[
                  albumUserIndex
                ].shared_to.map((el) => {
                  return (
                    <div>
                      <Icon name="user circle" />
                      <b>{el.username}</b>
                    </div>
                  );
                })}
              />
            )}
            <b>{this.props.albumsUserList[albumUserIndex].title}</b> <br />
            {this.props.albumsUserList[albumUserIndex].photo_count} Photo(s)
          </div>
        </div>
      );
    } else {
      return <div key={key} style={style} />;
    }
  };

  render() {
    return (
      <div>
        <div style={{ height: 60, paddingTop: 10 }}>
          <Header as="h2">
            <Icon name="bookmark" />
            <Header.Content>
              My Albums{" "}
              <Loader
                size="tiny"
                inline
                active={this.props.fetchingAlbumsUserList}
              />
              <Header.Subheader>
                Showing {this.props.albumsUserList.length} user created albums
              </Header.Subheader>
            </Header.Content>
          </Header>
        </div>
        <Modal
          size={"mini"}
          onClose={() => this.closeRenameDialog()}
          onOpen={() => this.openRenameDialog()}
          open={this.state.openRenameDialog}
        >
          <div style={{ padding: 20 }}>
            <Header as="h4">Rename album</Header>
            <Popup
              inverted
              content={
                'Album "' +
                this.state.newAlbumTitle.trim() +
                '" already exists.'
              }
              position="bottom center"
              open={this.props.albumsUserList
                .map((el) => el.title.toLowerCase().trim())
                .includes(this.state.newAlbumTitle.toLowerCase().trim())}
              trigger={
                <Input
                  fluid
                  error={this.props.albumsUserList
                    .map((el) => el.title.toLowerCase().trim())
                    .includes(this.state.newAlbumTitle.toLowerCase().trim())}
                  onChange={(e, v) => {
                    this.setState({ newAlbumTitle: v.value });
                  }}
                  placeholder="Album title"
                  action
                >
                  <input />
                  <Button
                    positive
                    onClick={() => {
                      this.props.dispatch(
                        renameUserAlbum(
                          this.state.albumID,
                          this.state.albumTitle,
                          this.state.newAlbumTitle
                        )
                      );
                      this.closeRenameDialog();
                    }}
                    disabled={this.props.albumsUserList
                      .map((el) => el.title.toLowerCase().trim())
                      .includes(this.state.newAlbumTitle.toLowerCase().trim())}
                    type="submit"
                  >
                    Rename
                  </Button>
                </Input>
              }
            />
          </div>
        </Modal>
        <Confirm
          open={this.state.openDeleteDialog}
          onCancel={this.closeDeleteDialog}
          onConfirm={() => {
            this.props.dispatch(
              deleteUserAlbum(this.state.albumID, this.state.albumTitle)
            );
            this.closeDeleteDialog();
          }}
        />
        <AutoSizer
          disableHeight
          style={{ outline: "none", padding: 0, margin: 0 }}
        >
          {({ width }) => (
            <Grid
              style={{ outline: "none" }}
              disableHeader={false}
              cellRenderer={this.cellRenderer}
              columnWidth={this.state.entrySquareSize}
              columnCount={this.state.numEntrySquaresPerRow}
              height={this.state.height - TOP_MENU_HEIGHT - 60}
              rowHeight={this.state.entrySquareSize + 60}
              rowCount={Math.ceil(
                this.props.albumsUserList.length /
                  this.state.numEntrySquaresPerRow.toFixed(1)
              )}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

AlbumUser = connect((store) => {
  return {
    albumsUserList: store.albums.albumsUserList,
    fetchingAlbumsUserList: store.albums.fetchingAlbumsUserList,
    fetchedAlbumsUserList: store.albums.fetchedAlbumsUserList,
  };
})(AlbumUser);
