import "./styles.css";
import React from "react";

export class App extends React.Component {
  state = {};

  parseData(newMap) {
    const flagMap = new Map();

    for (let facultyKey of newMap.keys()) {
      let varFaculty = newMap.get(facultyKey);
      let mapFaculty = new Map();
      flagMap.set(facultyKey, mapFaculty);

      for (let courseKey of varFaculty.keys()) {
        let varCourse = varFaculty.get(courseKey);
        let mapCourse = new Map();
        mapFaculty.set(courseKey, mapCourse);

        for (let semKey of varCourse.keys()) {
          let varSem = varCourse.get(semKey);
          let mapSem = new Map();
          mapCourse.set(semKey, { flag: false, data: mapSem });

          for (let subjKey of varSem.keys()) {
            let varSubj = varSem.get(subjKey);
            let mapSubj = new Map();
            mapSem.set(subjKey, {
              flag: false,
              isAdded: false,
              isDeleted: false,
              sourceVar: subjKey,
              isEdited: false,
              isEdititing: false,
              editedVar: subjKey,
              data: mapSubj
            });

            for (let modKey of varSubj.keys()) {
              let varMod = varSubj.get(modKey);
              let mapMod = new Map();
              mapSubj.set(modKey, {
                flag: false,
                isAdded: false,
                isDeleted: false,
                data: mapMod
              });

              for (let lectKey of varMod.keys()) {
                let titles = [];
                mapMod.set(lectKey, { flag: false, data: titles });

                for (let title of varMod.get(lectKey)) {
                  titles.push({
                    isAdded: false,
                    isDeleted: false,
                    var: title.title,
                    isEdited: false,
                    isEditing: false,
                    editedVar: title.title,
                    files: title.files.map(el => { return { name: el, isAdded: false, isDeleted: false, data: {} } }),
                    fileNames: title.files,
                    flag: false
                  });
                }
              }
            }
          }
        }
      }
    }

    return flagMap;
  }

  parseJsonMap(mapData) {
    let newMap = new Map();

    let faculties = Object.keys(mapData);

    for (let faculty of faculties) {
      let courseMap = new Map();
      newMap.set(faculty, courseMap);
      let courses = Object.keys(mapData[faculty]);

      for (let course of courses) {
        let semMap = new Map();
        courseMap.set(course, semMap);
        let semesters = Object.keys(mapData[faculty][course]);

        for (let sem of semesters) {
          let subjMap = new Map();
          semMap.set(sem, subjMap);
          let subjects = Object.keys(mapData[faculty][course][sem]);

          for (let subj of subjects) {
            let modMap = new Map();
            subjMap.set(subj, modMap);
            let modules = Object.keys(mapData[faculty][course][sem][subj]);

            for (let mod of modules) {
              let typeMap = new Map();
              modMap.set(mod, typeMap);
              let types = Object.keys(mapData[faculty][course][sem][subj][mod]);

              for (let type of types) {
                typeMap.set(type, mapData[faculty][course][sem][subj][mod][type]);
              }
            }
          }
        }
      }
    }

    return newMap;
  }

  componentDidMount() {
    fetch('http://localhost:8080/data/Лечебный факультет/1/1/1/Лекция')
      .then(response => response.json())
      .then(data => this.setState({
        dataMap: this.parseJsonMap(data),
        flags: this.parseData(this.parseJsonMap(data)),
        files: [],
        courses: [2, 3, 4, 5, 6]
      }));
  }

  constructor(props) {
    super(props);

    let flags = new Map();
    let courses = new Map();

    flags.set('Лечебный факультет', courses);
    courses.set('1 курс', courses);

    this.state = { dataMap: new Map(), flags: flags, files: [], courses: [2, 3, 4, 5, 6] };
  }

  checkModules(modMap) {
    let result = false;

    for (let module of modMap.values()) {
      result = result || module.flag;
    }

    return result;
  }

  anatomyHandler = () => {
    const isAnatomy = this.state.isShowAnatomy;

    this.setState({ isShowAnatomy: !isAnatomy });

    fetch('http://localhost:8080/data/Лечебный факультет/1/1/1/Лекция')
      .then(response => response.json())
      .then(data => this.setState({ data: data }));
  }

  someHandler = (el) => {
    el.flag = !el.flag;

    const flagMap = new Map(this.state.flags);
    this.setState({ flags: flagMap });
  }

  handleDrop = (e) => {
    e.preventDefault();
    let files = [...e.dataTransfer.files];
    // let fileTitles = files.map(el => el.name);
    let currentFiles = [...this.state.files];

    for (let file of files) {
      currentFiles.push(file);
    }

    this.setState({ files: currentFiles });
  }

  deleteFileHanlder = (idx) => {
    let currentFiles = [...this.state.files];
    let files = currentFiles.filter((el, index) => idx != index);

    this.setState({ files: files });
  }

  handleTotalDrop = (e) => {
    e.preventDefault();
  }

  handleAddModule = (subj, moduleNum) => {
    const moduleMap = new Map();
    subj.set(moduleNum.toString() + ' модуль', {
      flag: false,
      isAdded: true,
      isDeleted: false,
      data: moduleMap
    });
    moduleMap.set('Лекция', { flag: false, data: [] });
    moduleMap.set('Семинар', { flag: false, data: [] });

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleAddSunjTitleByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleAddSubjTitle = (e, lect) => {
    const title = e.target.value;
    e.target.value = "";


    if (!(!title || /^\s*$/.test(title))) {
      lect.data.push({
        isDeleted: false,
        isAdded: true,
        var: title,
        isEdited: false,
        isEditing: false,
        editedVar: title,
        files: [],
        fileNames: []
      });
      const newMap = new Map(this.state.flags);
      this.setState({ flags: newMap });
    }
  }

  handleAddSubjByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleAddSubj = (e, sem) => {
    const title = e.target.value;
    e.target.value = "";

    if (!(!title || /^\s*$/.test(title)) && !sem.data.has(title)) {
      const subjMap = new Map();
      sem.data.set(title, {
        flag: false,
        isAdded: true,
        isEdited: false,
        isDeleted: false,
        isEditing: false,
        sourceVar: title,
        editedVar: title,
        data: subjMap
      });

      const modMap = new Map();
      subjMap.set('1 модуль', { flag: false, data: modMap, isAdded: true, isDeleted: false });

      modMap.set('Лекция', { flag: false, data: [] })
      modMap.set('Семинар', { flag: false, data: [] });

      const newMap = new Map(this.state.flags);
      this.setState({ flags: newMap });
    }
  }

  handleDeleteTitle = (title) => {
    title.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleCancelDeleteTitle = (title) => {
    title.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleDeleteModule = (mod) => {
    mod.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleCancelDeleteModule = (mod) => {
    mod.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleDeleteSubj = (subj) => {
    subj.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleCancelDeleteSubj = (subj) => {
    subj.isDeleted = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitleByButton = (title) => {
    title.isEditing = true;
    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitle = (e, title) => {
    const str = e.target.value;
    e.target.value = "";

    if (!(!str || /^\s*$/.test(str))) {
      if (title.var === str) {
        title.isEdited = false;

      } else {
        title.isEdited = true;
      }

      title.editedVar = str;
    }

    title.isEditing = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditTitleByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  handleEditSubjectByButton = (subj) => {
    subj.isEditing = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditSubject = (e, subj, sem) => {
    const str = e.target.value;
    e.target.value = "";

    if (!(!str || /^\s*$/.test(str)) && !sem.data.has(str)) {
      if (subj.sourceVar === str) {
        subj.isEdited = false;
      } else {
        subj.isEdited = true;
      }

      subj.editedVar = str;
    }

    subj.isEditing = false;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleEditSubjectByKey = (e) => {
    if (e.keyCode === 27) {
      e.target.value = "";
      return;
    }

    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  contains(a, obj) {
    var i = a.filter(() => { return true; }).length;
    while (i--) {
      if (a[i] === obj) {
        return true;
      }
    }
    return false;
  }

  handleDropFile = (e, title) => {
    e.preventDefault();
    let files = [...e.dataTransfer.files];
    let currentFiles = title.files;
    title.flag = true;

    console.log(title.files);

    for (let file of files) {
      if (!this.contains(title.fileNames, file.name)) {
        let el = { name: file.name, isAdded: true, isDeleted: false, data: file };
        currentFiles.push(el);
        title.fileNames.push(file.name);
      }

    }

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleDeleteFile = (el) => {
    el.isDeleted = true;

    const newMap = new Map(this.state.flags);
    this.setState({ flags: newMap });
  }

  handleTotalDrop = (e) => {
    e.preventDefault();
  }

  checkTitles(lectMap) {
    let result = false;

    for (let title of lectMap) {
      result = result || (title.flag && title.files.length > 0);
    }

    return result;
  }

  sendFile = () => {
    const formData = new FormData();

    this.state.files.forEach(el => {
      formData.append("Лечебный факультет/1 курс/1 семестр/Анатомия/1 модуль/Лекция/Математика/", el);
    });

    fetch("http://localhost:8080/data/Лечебный факультет/1/1/1/Лекция", {
      mode: 'no-cors',
      method: "POST",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(function (res) {
      if (res.ok) {
        alert("Perfect! ");
      } else if (res.status == 401) {
        alert("Oops! ");
      }
    }, function (e) {
      alert("Error submitting form!");
    });
  }

  sendData = () => {
    let mapData = this.state.flags;

    let addSubj = [];
    let addMod = [];
    let addTitle = [];
    let addFiles = new FormData();

    let delSubj = [];
    let delMod = [];
    let delTitle = [];
    let delFiles = [];

    for (let faculty of mapData.entries()) {
      let str1 = faculty[0];

      for (let course of faculty[1].entries()) {
        let str2 = str1 + "/" + course[0];

        for (let subj of course[1].entries()) {
          let str3 = str2 + "/" + subj[0];

          for (let mod of subj[1].data.entries()) {
            let str4 = str3 + "/" + mod[0];

            if (mod[1].isAdded && !mod[1].isDeleted) {
              addSubj.push(str4);
            }

            if (mod[1].isDeleted && !mod[1].isAdded) {
              delSubj.push(str4);
            }
            // mod.isAdded;
            // mod.isDeleted;
            // mod.isEdited;
            // mod.editedVar;

            for (let type of mod[1].data.entries()) {
              let str5 = str4 + "/" + type[0];

              if (type[1].isAdded && !type[1].isDeleted) {
                addMod.push(str5);
              }

              if (type[1].isDeleted && !type[1].isAdded) {
                delMod.push(str5);
              }
              // type.isAdded;
              // type.isDeleted;

              for (let title of type[1].data) {
                let str6 = str5 + "/" + title[0];

                for (let file of title[1].data) {
                  let str7 = str6 + "/" + file.var;

                  if (file.isAdded && !file.isDeleted) {
                    addTitle.push(str7);
                  }

                  if (file.isDeleted && !file.isAdded) {
                    delTitle.push(str7);
                  }
                  // file.isAdded;
                  // file.isDeleted;
                  // file.isEdited;
                  // file.editedVar;

                  for (let info of file.files) {
                    let str8 = str7 + "/" + info.name;

                    if (info.isAdded && !info.isDeleted) {
                      addFiles.append(str7 + "/", info.data);
                    }

                    if (info.isDeleted && !info.isAdded) {
                      delFiles.push(str8);
                    }
                    // info.isAdded;
                    // info.isDeleted;
                    // info.data;
                    // info.name;
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log(addSubj);
    console.log(addMod);
    console.log(addTitle);

    fetch("http://localhost:8080/subject", {
      mode: 'no-cors', method: "POST", body: JSON.stringify(addSubj)
    })

    // fetch("http://localhost:8080/data/Лечебный факультет/1/1/1/Лекция", {
    //   mode: 'no-cors',
    //   method: "POST",
    //   body: addFiles,
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // }).then(function (res) {
    //   if (res.ok) {
    //     alert("Perfect! ");
    //   } else if (res.status == 401) {
    //     alert("Oops! ");
    //   }
    // }, function (e) {
    //   alert("Error submitting form!");
    // });
  }

  render() {
    return (

      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        border: "1px solid black",
        height: "98vh"
      }}>
        <div style={{
          width: "200px",
          border: "1px solid black"
        }}>
          <div style={{ border: "1px solid black" }}>
            <h1>Тверской ГМУ</h1>
          </div>
          <div style={{ border: "1px solid black" }}>
            Выберите факультет
          </div>
          <div>
            <ul>
              <li>Лечебный &gt;</li>
              <li>Стоматологический &gt;</li>
              <li>Педиатрический &gt;</li>
              <li>Фармацевтический &gt;</li>
              <li>Клин. психология &gt;</li>
            </ul>
          </div>
        </div>

        <div style={{
          border: "1px solid black",
          flexGrow: 1
        }}>
          <div style={{
            textAlign: "center",
            border: "1px solid black"
          }}>
            <h1>Выберите курс на котором Вы учитесь</h1>
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <div style={{
              border: "1px solid black"
              , width: "100%"
            }}>
              1 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              2 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              3 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              4 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              5 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              6 курс
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              ГОСы
            </div>
            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              Ординатура
            </div>

            <div style={{
              border: "1px solid black",
              width: "100%"
            }}>
              <button onClick={() => this.sendData()}>Сохранить</button>
            </div>
          </div>
          <div style={{ border: "1px solid black" }}>
            Нажать чтобы открылась строка
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            overflowY: "scroll",
            height: "800px"
          }}>
            <div style={{ width: "100%" }}>
              <ul>
                {[...this.state.flags.get("Лечебный факультет").get("1 курс").entries()].map(sem =>
                  <li>
                    <span onClick={() => this.someHandler(sem[1])}>
                      {sem[0]}
                    </span>

                    {sem[1].flag && <ul>
                      {[...sem[1].data.entries()].map(subj =>
                        <li>
                          {(!subj[1].isDeleted && !subj[1].isEditing) &&
                            <span>
                              <span onClick={() => this.someHandler(subj[1])}>
                                {subj[1].editedVar}
                              </span>

                              {!this.checkModules(sem[1].data) &&
                                <span>
                                  <button onClick={() => this.handleDeleteSubj(subj[1])}>X</button>
                                  <button onClick={() => this.handleEditSubjectByButton(subj[1])}>R</button>
                                </span>}
                            </span>}

                          {(!subj[1].isDeleted && subj[1].isEditing) &&
                            <input placeholder={subj[1].editedVar}
                              autoFocus
                              onBlur={(e) => this.handleEditSubject(e, subj[1], sem[1])}
                              onKeyDown={(e) => this.handleEditSubjectByKey(e)}></input>
                          }

                          {subj[1].isDeleted &&
                            <button onClick={() => this.handleCancelDeleteSubj(subj[1])}>Восстановить</button>}

                          {subj[1].flag && <ul>
                            {[...subj[1].data.entries()].map(mod =>
                              <li >
                                {!mod[1].isDeleted &&
                                  <span>
                                    <span onClick={() => this.someHandler(mod[1])}>
                                      {mod[0]}
                                    </span>
                                    {!this.checkModules(subj[1].data) &&
                                      <button onClick={() => this.handleDeleteModule(mod[1])}>X</button>}
                                  </span>}

                                {mod[1].isDeleted &&
                                  <button onClick={() => this.handleCancelDeleteModule(mod[1])}>Восстановить</button>}

                                {mod[1].flag &&
                                  <ul>
                                    {[...mod[1].data.entries()].map(lect =>
                                      <li>
                                        <span onClick={() => this.someHandler(lect[1])}>
                                          {lect[0]}
                                        </span>

                                        {lect[1].flag &&
                                          <ul>
                                            {lect[1].data.map(title =>
                                              <li>

                                                {(!title.isDeleted && !title.isEditing) &&
                                                  <span>
                                                    <span onDrop={(e) => this.handleDropFile(e, title)}
                                                      onDragStart={this.handleTotalDrop}
                                                      onDragLeave={this.handleTotalDrop}
                                                      onDragOver={this.handleTotalDrop}
                                                      onClick={() => this.someHandler(title)}>
                                                      {title.editedVar}
                                                    </span>

                                                    {!this.checkTitles(lect[1].data) && <button onClick={() => this.handleDeleteTitle(title)}>Х</button>}

                                                    {!this.checkTitles(lect[1].data) && <button onClick={() => this.handleEditTitleByButton(title)}>R</button>}

                                                    {title.flag && <ul style={{ listStyleType: "none" }}>
                                                      {title.files.map((el, idx) =>
                                                        <li>
                                                          <div style={{
                                                            display: "flex",
                                                            alignItems: "center"
                                                          }}>
                                                            {!el.isDeleted && <span><img height="32px" src="https://clck.ru/353YQL" />
                                                              {el.name}
                                                              <button onClick={() => this.handleDeleteFile(el)}>X</button> </span>}
                                                            {el.isDeleted && <button onClick={() => this.handleCancelDeleteModule(el)}>Восстановить</button>}
                                                          </div>
                                                        </li>)}
                                                    </ul>}
                                                  </span>}

                                                {(!title.isDeleted && title.isEditing) &&
                                                  <span>
                                                    <input onBlur={(e) => this.handleEditTitle(e, title)}
                                                      placeholder={title.editedVar}
                                                      autoFocus
                                                      onKeyDown={(e) => this.handleEditTitleByKey(e)}></input>
                                                  </span>}

                                                {title.isDeleted &&
                                                  <button onClick={() => this.handleCancelDeleteTitle(title)}>Восстановить</button>}
                                              </li>)}

                                            {!this.checkTitles(lect[1].data) &&
                                              <li>
                                                <input onBlur={(e) => this.handleAddSubjTitle(e, lect[1])}
                                                  onKeyDown={(e) => this.handleAddSunjTitleByKey(e)}
                                                  placeholder="Добавить Название"></input>
                                              </li>}

                                          </ul>}
                                      </li>)}
                                  </ul>}
                              </li>)}

                            {!this.checkModules(subj[1].data) &&
                              <li>
                                <button onClick={() => this.handleAddModule(subj[1].data, subj[1].data.size + 1)}> Добавить </button>
                              </li>}
                          </ul>}
                        </li>)}

                      {!this.checkModules(sem[1].data) &&
                        <li>
                          <input onBlur={(e) => this.handleAddSubj(e, sem[1])}
                            onKeyDown={(e) => this.handleAddSubjByKey(e)}
                            placeholder="Добавить Предмет"></input>
                        </li>}
                    </ul>}
                  </li>)}
              </ul>
            </div>

            {this.state.courses.map((el, idx) =>
              <div style={{ width: "100%" }}>
                <ul>
                  <li>1 семестр</li>
                  <li>2 семестр</li>
                </ul>
              </div>)}
            <div style={{ width: "100%" }}>
              <ul>
                <li>
                  <span
                    onDrop={(e) => this.handleDrop(e)}
                    onDragStart={this.handleTotalDrop}
                    onDragLeave={this.handleTotalDrop}
                    onDragOver={this.handleTotalDrop}>
                    тесты
                  </span>
                  <ul>
                    {this.state.files.map((el, idx) => <li style={{ listStyleType: "none" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%"
                      }}>
                        <img height="32px" src="https://clck.ru/353YQL" />{el.name}
                        <button style={{ backgroundColor: "transparent", borderColor: "transparent" }} onClick={() => this.deleteFileHanlder(idx)}>
                          <img src="https://clck.ru/353YcR" height="12px"></img>
                        </button>
                      </div>
                    </li>)}
                  </ul>
                </li>
                <li>задачи<button onClick={() => this.sendFile()}>отправить</button></li>
              </ul>
            </div>
            <div style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>

    );
  }
}
