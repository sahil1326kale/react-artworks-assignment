import React,{useState,useEffect,useRef} from "react";
import {DataTable} from "primereact/datatable";
import type {DataTablePageEvent} from "primereact/datatable";
import {Column} from "primereact/column";
import {Checkbox} from "primereact/checkbox";
import {OverlayPanel} from "primereact/overlaypanel";

interface Artwork{
  id:number;
  title:string;
  place_of_origin:string;
  artist_display:string;
  inscriptions:string;
  date_start:number;
  date_end:number;
}

const ROWS_PER_PAGE=12;

const ArtworksTable:React.FC=()=>{
  const [page,setPage]=useState<number>(1);
  const [artworks,setArtworks]=useState<Artwork[]>([]);
  const [loading,setLoading]=useState<boolean>(false);
  const [totalRecords,setTotalRecords]=useState<number>(0);
  const [selectedArtworks,setSelectedArtworks]=useState<Artwork[]>([]);
  const []=useState<number|null>(null);
  const overlayRef=useRef<OverlayPanel>(null);
  const [bulkSelectCount,setBulkSelectCount]=useState<string>("");

  useEffect(()=>{
    setLoading(true);
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${ROWS_PER_PAGE}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`)
    .then(res=>res.json())
    .then(json=>{
      const fetchedArtworks:Artwork[]=json.data.map((item:any)=>({
        id:item.id,
        title:item.title||'',
        place_of_origin:item.place_of_origin||'',
        artist_display:item.artist_display||'',
        inscriptions:item.inscriptions||'',
        date_start:item.date_start||0,
        date_end:item.date_end||0
      }));
      setArtworks(fetchedArtworks);
      setTotalRecords(json.pagination.total);
    })
    .catch(error=>{
      console.error('Error fetching artworks:',error);
      setArtworks([]);
      setTotalRecords(0);
    })
    .finally(()=>setLoading(false));
  },[page]);

  const onPageChange=(e:DataTablePageEvent)=>{
    const newPage=e.page?e.page+1:1;
    setPage(newPage);
  };


  const onSelectAllCurrentPage=(isSelected:boolean)=>{
    setSelectedArtworks(prev=>{
      return isSelected
        ?[...prev,...artworks.filter(a=>!prev.some(s=>s.id===a.id))]
        :prev.filter(a=>!artworks.some(c=>c.id===a.id));
    });
  };

  const onBulkSelectSubmit=async()=>{
    const count=parseInt(bulkSelectCount);
    if(isNaN(count)||count<=0)return;

    setLoading(true);
    let selectedCount=0;
    const bulkSelected:Artwork[]=[];
    let currentPage=1;

    try{
      while(selectedCount<count){
        const res=await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${ROWS_PER_PAGE}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`);
        const json=await res.json();
        for(const item of json.data){
          if(selectedCount>=count)break;
          bulkSelected.push({
            id:item.id,
            title:item.title||'',
            place_of_origin:item.place_of_origin||'',
            artist_display:item.artist_display||'',
            inscriptions:item.inscriptions||'',
            date_start:item.date_start||0,
            date_end:item.date_end||0
          });
          selectedCount++;
        }
        if(!json.pagination?.next_url||selectedCount>=count)break;
        currentPage++;
      }
      setSelectedArtworks(bulkSelected);
      setPage(1);
    }catch(e){
      console.error('Error in bulk selection:',e);
    }finally{
      setLoading(false);
      overlayRef.current?.hide();
      setBulkSelectCount("");
    }
  };


  const headerCheckbox=()=>(
    <div style={{display:"flex",alignItems:"center"}}>
      <Checkbox
        checked={artworks.length>0&&artworks.every(a=>selectedArtworks.some(s=>s.id===a.id))}
        onChange={e=>onSelectAllCurrentPage(!!e.checked)}
        aria-label="Select All Artworks On This Page"
        style={{marginRight:"6px"}}
      />
      <i
        className="pi pi-chevron-down"
        style={{fontSize:"1.5em",cursor:"pointer"}}
        onClick={e=>overlayRef.current?.toggle(e)}
        role="button"
        tabIndex={0}
        onKeyPress={e=>{
          if(e.key==="Enter"||e.key===" ")overlayRef.current?.toggle(e);
        }}
      />
      <OverlayPanel
        ref={overlayRef}
        showCloseIcon
        style={{padding:"1rem",width:"250px"}}
      >
        <label htmlFor="bulkSelectInput">Enter number of rows to select:</label>
        <input
          id="bulkSelectInput"
          type="number"
          min={1}
          value={bulkSelectCount}
          onChange={e=>setBulkSelectCount(e.target.value)}
          style={{
            marginTop:"0.5rem",
            marginBottom:"1rem",
            padding:"0.5rem",
            width:"100%",
            fontSize:"1rem"
          }}
        />
        <button
          style={{padding:"0.5rem",width:"100%"}}
          onClick={onBulkSelectSubmit}
        >
          Select Rows
        </button>
      </OverlayPanel>
    </div>
  );


  return(
    <div style={{padding:"1rem"}}>
      <h2>Art Institute of Chicago - Artworks</h2>
      <DataTable
        value={artworks}
        paginator
        lazy
        rows={ROWS_PER_PAGE}
        first={(page-1)*ROWS_PER_PAGE}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange}
        selection={selectedArtworks}
        onSelectionChange={e=>setSelectedArtworks(Array.isArray(e.value)?e.value as Artwork[]:[e.value as Artwork])}
        dataKey="id"
        selectionMode="multiple"
      >
        <Column
          selectionMode="multiple"
          header={headerCheckbox()}
          style={{width:"4em"}}
        />
        <Column field="title" header="Title" sortable/>
        <Column field="place_of_origin" header="Origin"/>
        <Column field="artist_display" header="Artist"/>
        <Column field="inscriptions" header="Inscriptions"/>
        <Column field="date_start" header="Year Start" sortable/>
        <Column field="date_end" header="Year End" sortable/>
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
